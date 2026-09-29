import { notFound } from "next/navigation";
import { ReconSummaryPanel } from "@/components/reconciliation/ReconSummary";
import { ReconTable } from "@/components/reconciliation/ReconTable";
import { RECON_STATUS_FILTERS } from "@/lib/reconciliation/status-filters";
import { RunReconciliationButton } from "@/components/reconciliation/RunReconciliationButton";
import { EmptyState } from "@/components/shared/EmptyState";
import { getClientDbId } from "@/lib/supabase/queries/clients";
import { getReconSummary, getReconRows } from "@/lib/supabase/queries/reconciliations";
import { getExceptions } from "@/lib/supabase/queries/exceptions";
import type { ReconResultType } from "@/lib/types";

const PAGE_SIZE = 25;

export default async function ReconciliationPage({
  params,
  searchParams,
}: {
  params: { clientId: string };
  searchParams: { page?: string; status?: string; q?: string };
}) {
  const dbId = await getClientDbId(params.clientId);
  if (!dbId) notFound();

  const summary = await getReconSummary(dbId);

  if (!summary) {
    return (
      <div className="flex flex-col gap-4">
        <EmptyState
          title="No reconciliation run yet"
          description="Once a purchase register and GSTR-2B export are uploaded, run the deterministic matching engine."
        />
        <RunReconciliationButton clientDbId={dbId} />
      </div>
    );
  }

  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);
  const status = RECON_STATUS_FILTERS.includes(searchParams.status as ReconResultType)
    ? (searchParams.status as ReconResultType)
    : "ALL";
  const search = searchParams.q ?? "";

  const [{ rows, total }, exceptions] = await Promise.all([
    getReconRows(dbId, { page, pageSize: PAGE_SIZE, status, search }),
    getExceptions(dbId),
  ]);
  const exceptionsByInvoice = Object.fromEntries(exceptions.map((e) => [e.invoiceNumber, e.id]));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div className="w-96">
          <ReconSummaryPanel summary={summary} />
        </div>
        <RunReconciliationButton clientDbId={dbId} />
      </div>
      <ReconTable
        rows={rows}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        status={status}
        search={search}
        clientId={params.clientId}
        exceptionsByInvoice={exceptionsByInvoice}
      />
    </div>
  );
}
