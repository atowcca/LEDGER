// POST /api/reconciliations/run
// body: { clientId: string, period: string }
//
// Pulls this client's PURCHASE_REGISTER and GSTR_2B transactions, runs the
// deterministic engine (lib/reconciliation/engine.ts), and writes a
// reconciliations row + reconciliation_results rows + exceptions.
//
// Three properties matter at real scale (ABC Manufacturing has ~4,900 rows):
//  1. It reads EVERY transaction. PostgREST caps one query at 1,000 rows, so
//     this pages through with fetchAllPages — a single select would silently
//     reconcile only the first 1,000 and save wrong results.
//  2. It is safe to re-run. An invoice that already has an exception does not
//     get a second one; only genuinely new discrepancies create exceptions.
//  3. Exception codes come from the highest existing number in the firm, not
//     "the most recently created row" (bulk-seeded rows share a timestamp, so
//     that could pick a code that already exists and violate uniqueness).
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { fetchAllPages } from "@/lib/supabase/fetch-all";
import { reconcile, summarize } from "@/lib/reconciliation/engine";
import { draftExceptionFromResult } from "@/lib/reconciliation/exceptions-from-results";
import type { ReconciliationTransaction } from "@/lib/reconciliation/types";

const INSERT_CHUNK = 500;

async function insertInChunks<T extends Record<string, unknown>>(
  supabase: ReturnType<typeof createClient>,
  table: "reconciliation_results" | "exceptions",
  rows: T[]
): Promise<string | null> {
  for (let i = 0; i < rows.length; i += INSERT_CHUNK) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await supabase.from(table).insert(rows.slice(i, i + INSERT_CHUNK) as any);
    if (error) return error.message;
  }
  return null;
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const clientId = body?.clientId;
  const period = body?.period ?? "August 2026";

  if (typeof clientId !== "string") {
    return NextResponse.json({ error: "clientId is required." }, { status: 400 });
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { data: me } = await supabase
    .from("users")
    .select("firm_id")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (!me) {
    return NextResponse.json({ error: "No matching users row for this session." }, { status: 403 });
  }

  const reconciliationId = randomUUID();
  const fail = async (message: string) => {
    await supabase.from("reconciliations").update({ status: "FAILED" }).eq("id", reconciliationId);
    return NextResponse.json({ error: message }, { status: 500 });
  };

  await supabase.from("reconciliations").insert({
    id: reconciliationId,
    firm_id: me.firm_id,
    client_id: clientId,
    name: "Purchase Register vs GSTR-2B",
    period,
    source_a: "PURCHASE_REGISTER",
    source_b: "GSTR_2B",
    status: "RUNNING",
  });

  let transactions;
  let existingExceptionRows;
  let codeRows;
  try {
    [transactions, existingExceptionRows, codeRows] = await Promise.all([
      fetchAllPages((from, to) =>
        supabase.from("transactions").select("*").eq("client_id", clientId).order("id").range(from, to)
      ),
      fetchAllPages((from, to) =>
        supabase.from("exceptions").select("transaction_id").eq("client_id", clientId).order("id").range(from, to)
      ),
      fetchAllPages((from, to) =>
        supabase.from("exceptions").select("display_code").eq("firm_id", me.firm_id).order("id").range(from, to)
      ),
    ]);
  } catch (err) {
    return fail((err as Error).message);
  }

  const toEngineTxn = (t: (typeof transactions)[number]): ReconciliationTransaction => ({
    id: t.id,
    vendorName: t.vendor_name,
    vendorGstin: t.vendor_gstin,
    invoiceNumber: t.invoice_number,
    invoiceDate: t.invoice_date,
    taxableValue: Number(t.taxable_value),
    cgst: Number(t.cgst),
    sgst: Number(t.sgst),
    igst: Number(t.igst),
    totalAmount: Number(t.total_amount),
  });

  const purchaseRegister = transactions.filter((t) => t.source === "PURCHASE_REGISTER").map(toEngineTxn);
  const gstr2b = transactions.filter((t) => t.source === "GSTR_2B").map(toEngineTxn);
  const purchaseById = new Map(purchaseRegister.map((t) => [t.id, t]));

  const results = reconcile(purchaseRegister, gstr2b);
  const summary = summarize(results);

  const resultRows = results.map((r) => ({
    id: randomUUID(),
    firm_id: me.firm_id,
    reconciliation_id: reconciliationId,
    transaction_id: r.purchaseTransactionId,
    matched_transaction_id: r.matchedTransactionId,
    result_type: r.resultType,
    difference_amount: r.differenceAmount,
    explanation: r.explanation,
  }));

  const resultsError = await insertInChunks(supabase, "reconciliation_results", resultRows);
  if (resultsError) return fail(resultsError);

  // Only create exceptions for discrepancies that don't already have one.
  const alreadyHasException = new Set(existingExceptionRows.map((e) => e.transaction_id));
  let nextNumber =
    codeRows.reduce((max, row) => {
      const n = parseInt(row.display_code.replace(/\D/g, ""), 10);
      return Number.isNaN(n) ? max : Math.max(max, n);
    }, 1000) + 1;

  const exceptionRows = [];
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    if (alreadyHasException.has(result.purchaseTransactionId)) continue;

    const draft = draftExceptionFromResult(result, purchaseById.get(result.purchaseTransactionId)?.taxableValue ?? 0);
    if (!draft) continue;

    exceptionRows.push({
      id: randomUUID(),
      firm_id: me.firm_id,
      client_id: clientId,
      reconciliation_id: reconciliationId,
      reconciliation_result_id: resultRows[i].id,
      transaction_id: result.purchaseTransactionId,
      display_code: `EX-${nextNumber++}`,
      exception_type: draft.exceptionType,
      severity: draft.severity,
      why_explanation: draft.whyExplanation,
      ai_suggested_steps: draft.aiSuggestedSteps,
      status: "OPEN" as const,
    });
  }

  const exceptionsError = await insertInChunks(supabase, "exceptions", exceptionRows);
  if (exceptionsError) return fail(exceptionsError);

  await supabase
    .from("reconciliations")
    .update({ status: "COMPLETE", run_at: new Date().toISOString() })
    .eq("id", reconciliationId);

  return NextResponse.json({
    reconciliationId,
    summary,
    exceptionsCreated: exceptionRows.length,
    exceptionsAlreadyExisting: results.filter((r) => r.resultType !== "MATCHED").length - exceptionRows.length,
  });
}
