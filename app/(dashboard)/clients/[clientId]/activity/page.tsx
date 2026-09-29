import { notFound } from "next/navigation";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatDate } from "@/lib/format";
import { getClientDbId } from "@/lib/supabase/queries/clients";
import { getActivity } from "@/lib/supabase/queries/activity";

export default async function ActivityPage({
  params,
}: {
  params: { clientId: string };
}) {
  const dbId = await getClientDbId(params.clientId);
  if (!dbId) notFound();

  const activity = await getActivity(dbId);

  if (activity.length === 0) {
    return (
      <EmptyState
        title="No activity yet"
        description="Actions taken on documents, reconciliations, and exceptions for this client will appear here."
      />
    );
  }

  return (
    <div className="panel divide-y divide-border">
      {activity.map((event) => (
        <div key={event.id} className="flex gap-4 px-4 py-3">
          <div className="w-24 shrink-0">
            <p className="num text-sm text-ink">{event.time}</p>
            <p className="text-xs text-ink-faint">{formatDate(event.date)}</p>
          </div>
          <p className="text-sm text-ink-soft">{event.description}</p>
        </div>
      ))}
    </div>
  );
}
