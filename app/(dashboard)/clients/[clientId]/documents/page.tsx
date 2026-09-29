import { notFound } from "next/navigation";
import { UploadDropzone } from "@/components/documents/UploadDropzone";
import { DocumentTable } from "@/components/documents/DocumentTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { getClientDbId } from "@/lib/supabase/queries/clients";
import { getDocuments } from "@/lib/supabase/queries/documents";

export default async function DocumentsPage({
  params,
}: {
  params: { clientId: string };
}) {
  const dbId = await getClientDbId(params.clientId);
  if (!dbId) notFound();

  const documents = await getDocuments(dbId);

  return (
    <div>
      <UploadDropzone clientDbId={dbId} />
      {documents.length === 0 ? (
        <EmptyState
          title="No documents yet"
          description="Uploaded invoices, statements, and registers for this client will appear here."
        />
      ) : (
        <DocumentTable documents={documents} />
      )}
    </div>
  );
}
