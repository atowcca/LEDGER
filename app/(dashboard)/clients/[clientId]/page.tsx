import { notFound } from "next/navigation";
import { getClient, getClientDbId } from "@/lib/supabase/queries/clients";
import { getReconSummary } from "@/lib/supabase/queries/reconciliations";
import { getExceptions } from "@/lib/supabase/queries/exceptions";

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="panel px-5 py-4">
      <p className="font-mono text-2xl font-medium tabular-nums text-ink">{value}</p>
      <p className="mt-1 text-sm text-ink-soft">{label}</p>
    </div>
  );
}

export default async function ClientOverviewPage({
  params,
}: {
  params: { clientId: string };
}) {
  const [client, dbId] = await Promise.all([getClient(params.clientId), getClientDbId(params.clientId)]);
  if (!client || !dbId) notFound();

  const [summary, exceptions] = await Promise.all([getReconSummary(dbId), getExceptions(dbId)]);

  const open = exceptions.filter((e) => ["OPEN", "ASSIGNED"].includes(e.status)).length;
  const awaiting = exceptions.filter((e) => e.status === "AWAITING_CLIENT").length;
  const readyForReview = exceptions.filter((e) => e.status === "UNDER_REVIEW").length;

  return (
    <div>
      <div className="grid grid-cols-3 gap-3">
        <Metric label="Documents" value={client.documentsCount} />
        <Metric label="Transactions" value={summary?.purchaseEntries ?? 0} />
        <Metric label="Exceptions" value={client.exceptionsCount} />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-3">
        <Metric label="Open" value={open} />
        <Metric label="Awaiting client" value={awaiting} />
        <Metric label="Ready for review" value={readyForReview} />
      </div>

      {exceptions.length === 0 && (
        <p className="mt-6 text-sm text-ink-soft">
          Onboarding in progress — no reconciliation run yet for this client.
        </p>
      )}
    </div>
  );
}
