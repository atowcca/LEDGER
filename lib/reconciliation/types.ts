// Engine-level types — deliberately independent of the Supabase schema types
// so the matching logic is a pure, DB-agnostic function you can unit test
// without a database. The API route (app/api/reconciliations/run) maps
// database rows to these shapes and back.

export interface ReconciliationTransaction {
  id: string;
  vendorName: string;
  vendorGstin: string;
  invoiceNumber: string;
  invoiceDate: string; // ISO date, YYYY-MM-DD
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalAmount: number;
}

export type ReconResultType =
  | "MATCHED"
  | "PARTIAL_MATCH"
  | "AMOUNT_MISMATCH"
  | "MISSING_IN_2B"
  | "GSTIN_MISMATCH"
  | "DUPLICATE";

export interface ReconciliationResult {
  purchaseTransactionId: string;
  matchedTransactionId: string | null;
  resultType: ReconResultType;
  differenceAmount: number | null;
  explanation: string;
}

export interface ReconciliationSummary {
  purchaseEntries: number;
  matched: number;
  partialMatch: number;
  amountMismatch: number;
  missingIn2B: number;
  gstinMismatch: number;
  duplicates: number;
}
