// Returns lib/types.ts view models — see lib/supabase/mappers.ts.
// Function names/signatures mirror lib/mock-data.ts.
import { createClient } from "@/lib/supabase/server";
import { mapException } from "@/lib/supabase/mappers";
import { fetchAllPages } from "@/lib/supabase/fetch-all";
import type { ExceptionRecord, ExceptionStatus } from "@/lib/types";

const EXCEPTION_SELECT = `
  *,
  assigned_to:users(id, name, role),
  client:clients(slug, name),
  transaction:transactions!exceptions_transaction_id_fkey(vendor_name, vendor_gstin, invoice_number, invoice_date, taxable_value),
  reconciliation_result:reconciliation_results!exceptions_reconciliation_result_id_fkey(
    difference_amount,
    matched_transaction:transactions!reconciliation_results_matched_transaction_id_fkey(taxable_value)
  ),
  evidence(*)
`;

// Paged through fully (PostgREST caps a single query at 1,000 rows). Ordered by
// display_code as a stable tiebreaker since bulk-seeded rows share a created_at.
export async function getExceptions(clientId: string): Promise<ExceptionRecord[]> {
  const supabase = createClient();
  const rows = await fetchAllPages((from, to) =>
    supabase
      .from("exceptions")
      .select(EXCEPTION_SELECT)
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })
      .order("display_code", { ascending: true })
      .range(from, to)
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return rows.map((row: any) => mapException(row));
}

export async function getException(displayCode: string): Promise<ExceptionRecord | undefined> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("exceptions")
    .select(EXCEPTION_SELECT)
    .eq("display_code", displayCode)
    .maybeSingle();
  if (error) throw error;
  if (!data) return undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return mapException(data as any);
}

export async function getExceptionByInvoice(
  clientId: string,
  invoiceNumber: string
): Promise<ExceptionRecord | undefined> {
  const exceptions = await getExceptions(clientId);
  return exceptions.find((e) => e.invoiceNumber === invoiceNumber);
}

export async function getAllExceptions(): Promise<ExceptionRecord[]> {
  const supabase = createClient();
  const rows = await fetchAllPages((from, to) =>
    supabase
      .from("exceptions")
      .select(EXCEPTION_SELECT)
      .order("created_at", { ascending: false })
      .order("display_code", { ascending: true })
      .range(from, to)
  );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return rows.map((row: any) => mapException(row));
}

export async function listExceptionsForReview(): Promise<ExceptionRecord[]> {
  const all = await getAllExceptions();
  return all.filter((e) => ["UNDER_REVIEW", "AWAITING_CLIENT"].includes(e.status));
}

// --- Mutations — called from Server Actions (app/actions/exceptions.ts), never directly from the browser. ---

export async function assignException(displayCode: string, userId: string) {
  const supabase = createClient();
  const { data: exception } = await supabase
    .from("exceptions")
    .select("id, status")
    .eq("display_code", displayCode)
    .maybeSingle();
  if (!exception) throw new Error("Exception not found");

  const { error } = await supabase
    .from("exceptions")
    .update({
      assigned_to: userId,
      status: exception.status === "OPEN" ? "ASSIGNED" : exception.status,
    })
    .eq("id", exception.id);
  if (error) throw error;
}

export async function updateExceptionStatus(displayCode: string, status: ExceptionStatus) {
  const supabase = createClient();
  const { error } = await supabase
    .from("exceptions")
    .update({
      status,
      resolved_at: status === "RESOLVED" ? new Date().toISOString() : null,
    })
    .eq("display_code", displayCode);
  if (error) throw error;
}
