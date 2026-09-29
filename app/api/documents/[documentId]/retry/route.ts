// POST /api/documents/:documentId/retry
// Re-runs Gemini extraction against the already-uploaded file — for the
// "Retry" action on a Failed document (spec section 15/55).
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { extractInvoiceData, averageConfidence } from "@/lib/ai/gemini";
import { DOCUMENTS_BUCKET } from "@/lib/documents/storage";

export async function POST(
  _request: NextRequest,
  { params }: { params: { documentId: string } }
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { data: doc } = await supabase
    .from("documents")
    .select("*")
    .eq("id", params.documentId)
    .maybeSingle();
  if (!doc) {
    return NextResponse.json({ error: "Document not found." }, { status: 404 });
  }

  const admin = createServiceRoleClient();
  await admin.from("documents").update({ processing_status: "Processing" }).eq("id", doc.id);

  const { data: file, error: downloadError } = await admin.storage
    .from(DOCUMENTS_BUCKET)
    .download(doc.storage_path);
  if (downloadError || !file) {
    await admin.from("documents").update({ processing_status: "Failed" }).eq("id", doc.id);
    return NextResponse.json({ error: "Could not re-read the stored file." }, { status: 500 });
  }

  try {
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const extraction = await extractInvoiceData(fileBuffer, file.type);
    const confidence = averageConfidence(extraction);

    await admin
      .from("documents")
      .update({
        processing_status: "Processed",
        extracted_data: extraction,
        extracted_confidence: confidence,
      })
      .eq("id", doc.id);

    return NextResponse.json({ processingStatus: "Processed", extraction, confidence });
  } catch (err) {
    await admin.from("documents").update({ processing_status: "Failed" }).eq("id", doc.id);
    return NextResponse.json(
      { processingStatus: "Failed", error: (err as Error).message },
      { status: 502 }
    );
  }
}
