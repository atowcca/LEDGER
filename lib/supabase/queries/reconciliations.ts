// Returns lib/types.ts view models — see lib/supabase/mappers.ts.
//
// Scale note: ABC Manufacturing has 2,500 reconciliation rows, and PostgREST
// truncates any single query at 1,000. So the summary uses database-side COUNT
// queries (never fetching rows), and the table fetches one page at a time with
// server-side filtering — nothing here ever loads the full result set.
import { createClient } from "@/lib/supabase/server";
import type { ReconciliationRow, ReconciliationSummary, ReconResultType } from "@/lib/types";

async function getLatestCompleteReconciliation(clientId: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("reconciliations")
    .select("id, period")
    .eq("client_id", clientId)
    .eq("status", "COMPLETE")
    .order("run_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return data;
}

const RESULT_TYPES: ReconResultType[] = [
  "MATCHED",
  "PARTIAL_MATCH",
  "AMOUNT_MISMATCH",
  "MISSING_IN_2B",
  "GSTIN_MISMATCH",
  "DUPLICATE",
];

export async function getReconSummary(clientId: string): Promise<ReconciliationSummary | undefined> {
  const supabase = createClient();
  const recon = await getLatestCompleteReconciliation(clientId);
  if (!recon) return undefined;

  const results = await Promise.all(
    RESULT_TYPES.map((type) =>
      supabase
        .from("reconciliation_results")
        .select("*", { count: "exact", head: true })
        .eq("reconciliation_id", recon.id)
        .eq("result_type", type)
    )
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) throw failed.error;

  const c = Object.fromEntries(RESULT_TYPES.map((t, i) => [t, results[i].count ?? 0])) as Record<
    ReconResultType,
    number
  >;

  return {
    clientId,
    period: recon.period,
    purchaseEntries: RESULT_TYPES.reduce((sum, t) => sum + c[t], 0),
    matched: c.MATCHED,
    partialMatch: c.PARTIAL_MATCH,
    amountMismatch: c.AMOUNT_MISMATCH,
    missingIn2B: c.MISSING_IN_2B,
    gstinMismatch: c.GSTIN_MISMATCH,
    duplicates: c.DUPLICATE,
  };
}

export interface ReconRowsQuery {
  page: number; // 1-based
  pageSize: number;
  status: ReconResultType | "ALL";
  search: string;
}

export async function getReconRows(
  clientId: string,
  { page, pageSize, status, search }: ReconRowsQuery
): Promise<{ rows: ReconciliationRow[]; total: number }> {
  const supabase = createClient();
  const recon = await getLatestCompleteReconciliation(clientId);
  if (!recon) return { rows: [], total: 0 };

  let query = supabase
    .from("reconciliation_results")
    .select(
      `
      id,
      result_type,
      difference_amount,
      purchase_txn:transactions!reconciliation_results_transaction_id_fkey!inner(vendor_name, vendor_gstin, invoice_number, invoice_date, taxable_value),
      gstr2b_txn:transactions!reconciliation_results_matched_transaction_id_fkey(taxable_value)
      `,
      { count: "exact" }
    )
    .eq("reconciliation_id", recon.id);

  if (status !== "ALL") query = query.eq("result_type", status);

  const term = search.trim().replace(/[%,()]/g, "");
  if (term) {
    query = query.or(`vendor_name.ilike.%${term}%,invoice_number.ilike.%${term}%`, {
      referencedTable: "purchase_txn",
    });
  }

  // Enum order is MATCHED → … → DUPLICATE, so descending shows the exceptions
  // first; id keeps paging stable.
  const from = (page - 1) * pageSize;
  const { data, error, count } = await query
    .order("result_type", { ascending: false })
    .order("id", { ascending: true })
    .range(from, from + pageSize - 1);
  if (error) throw error;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = (data ?? []).map((row: any) => ({
    id: row.id,
    clientId,
    vendorName: row.purchase_txn?.vendor_name ?? "",
    vendorGstin: row.purchase_txn?.vendor_gstin ?? "",
    invoiceNumber: row.purchase_txn?.invoice_number ?? "",
    invoiceDate: row.purchase_txn?.invoice_date ?? "",
    purchaseValue: row.purchase_txn?.taxable_value != null ? Number(row.purchase_txn.taxable_value) : null,
    gstr2bValue: row.gstr2b_txn?.taxable_value != null ? Number(row.gstr2b_txn.taxable_value) : null,
    difference: row.difference_amount != null ? Number(row.difference_amount) : null,
    status: row.result_type,
  }));

  return { rows, total: count ?? 0 };
}
