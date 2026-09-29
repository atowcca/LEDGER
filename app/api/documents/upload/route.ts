// POST /api/documents/upload
// multipart/form-data: file, clientId, documentType
//
// Flow (spec section 16): Upload → Storage → Document record → AI processing
// → Extraction → Save result → Display. Runs synchronously in one request —
// deliberately no job queue, per spec section 53 ("avoid complex background
// workers" for this MVP). If extraction is slow in practice, split this into
// an upload step + a polled/streamed extraction step rather than adding a queue.
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { buildStoragePath, uploadDocumentFile } from "@/lib/documents/storage";
import { extractInvoiceData, averageConfidence } from "@/lib/ai/gemini";
import type { DocumentType } from "@/lib/supabase/database.types";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const file = form.get("file");
  const clientId = form.get("clientId");
  const documentType = form.get("documentType") as DocumentType | null;

  if (!(file instanceof File) || typeof clientId !== "string" || !documentType) {
    return NextResponse.json(
      { error: "file, clientId, and documentType are required." },
      { status: 400 }
    );
  }

  // Authenticated client — confirms the caller can actually see this client
  // (RLS enforces firm scoping), and gives us their firm_id/user id.
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { data: me } = await supabase
    .from("users")
    .select("id, firm_id")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (!me) {
    return NextResponse.json({ error: "No matching users row for this session." }, { status: 403 });
  }

  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("id", clientId)
    .maybeSingle();
  if (!client) {
    return NextResponse.json({ error: "Client not found or not accessible." }, { status: 404 });
  }

  const documentId = randomUUID();
  const storagePath = buildStoragePath({
    firmId: me.firm_id,
    clientId,
    documentId,
    fileName: file.name,
  });
  const fileBuffer = Buffer.from(await file.arrayBuffer());

  // From here on, use the service-role client: uploading to storage and
  // writing extraction results is trusted background work, not a
  // user-scoped RLS write (see lib/supabase/service-role.ts).
  const admin = createServiceRoleClient();

  await uploadDocumentFile({ storagePath, fileBuffer, contentType: file.type });

  const { error: insertError } = await admin.from("documents").insert({
    id: documentId,
    firm_id: me.firm_id,
    client_id: clientId,
    file_name: file.name,
    storage_path: storagePath,
    document_type: documentType,
    processing_status: "Processing",
    uploaded_by: me.id,
  });
  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // Only GST invoices go through Gemini extraction in this MVP — bank
  // statements / registers / GSTR-2B exports are parsed differently
  // (Batch 4's reconciliation engine reads those directly).
  if (documentType !== "GST Invoice") {
    await admin
      .from("documents")
      .update({ processing_status: "Ready" })
      .eq("id", documentId);
    return NextResponse.json({ documentId, processingStatus: "Ready" });
  }

  try {
    const extraction = await extractInvoiceData(fileBuffer, file.type);
    const confidence = averageConfidence(extraction);

    await admin
      .from("documents")
      .update({
        processing_status: "Processed",
        extracted_data: extraction,
        extracted_confidence: confidence,
      })
      .eq("id", documentId);

    return NextResponse.json({
      documentId,
      processingStatus: "Processed",
      extraction,
      confidence,
    });
  } catch (err) {
    await admin.from("documents").update({ processing_status: "Failed" }).eq("id", documentId);
    return NextResponse.json(
      { documentId, processingStatus: "Failed", error: (err as Error).message },
      { status: 502 }
    );
  }
}
