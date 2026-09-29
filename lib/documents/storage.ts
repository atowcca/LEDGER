// Supabase Storage helpers — server only. Files live under
// /{firm_id}/{client_id}/{document_id}/{filename} per spec section 38,
// in a private bucket accessed only through signed URLs, never a public one.
import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export const DOCUMENTS_BUCKET = "documents";

export function buildStoragePath(params: {
  firmId: string;
  clientId: string;
  documentId: string;
  fileName: string;
}): string {
  const { firmId, clientId, documentId, fileName } = params;
  return `${firmId}/${clientId}/${documentId}/${fileName}`;
}

export async function uploadDocumentFile(params: {
  storagePath: string;
  fileBuffer: Buffer;
  contentType: string;
}) {
  const supabase = createServiceRoleClient();
  const { error } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .upload(params.storagePath, params.fileBuffer, {
      contentType: params.contentType,
      upsert: false,
    });
  if (error) throw error;
}

export async function getSignedDocumentUrl(storagePath: string, expiresInSeconds = 3600) {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .createSignedUrl(storagePath, expiresInSeconds);
  if (error) throw error;
  return data.signedUrl;
}
