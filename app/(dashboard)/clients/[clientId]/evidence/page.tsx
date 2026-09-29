import { notFound } from "next/navigation";
import { EvidenceTimeline } from "@/components/evidence/EvidenceTimeline";
import { EmptyState } from "@/components/shared/EmptyState";
import { getClientDbId } from "@/lib/supabase/queries/clients";
import { getExceptions } from "@/lib/supabase/queries/exceptions";

export default async function EvidencePage({
  params,
}: {
  params: { clientId: string };
}) {
  const dbId = await getClientDbId(params.clientId);
  if (!dbId) notFound();

  const exceptions = await getExceptions(dbId);

  if (exceptions.length === 0) {
    return (
      <EmptyState
        title="No evidence trails yet"
        description="Once exceptions are raised, each one builds an evidence trail from source data through to partner review."
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {exceptions.map((e) => (
        <EvidenceTimeline key={e.id} exception={e} />
      ))}
    </div>
  );
}
