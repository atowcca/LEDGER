// Turns non-MATCHED reconciliation results into exception records — spec
// section 26: "Every meaningful reconciliation discrepancy should become an
// exception." This is still deterministic (a lookup table), not an LLM call —
// the AI's job (lib/ai/prompts.ts) is explaining an exception after it
// exists, not deciding whether one should.
import type { ReconciliationResult, ReconResultType } from "./types";
import type { ExceptionSeverity } from "@/lib/supabase/database.types";

const WHY: Record<ReconResultType, string[]> = {
  MATCHED: [],
  PARTIAL_MATCH: ["Most fields match; the differing field needs confirmation."],
  AMOUNT_MISMATCH: [
    "Vendor GSTIN, invoice number, and date match.",
    "Taxable amount differs.",
  ],
  MISSING_IN_2B: [
    "Invoice appears in the purchase register.",
    "No matching entry found in GSTR-2B for this period.",
  ],
  GSTIN_MISMATCH: [
    "Invoice number and amount match.",
    "Vendor GSTIN on the purchase register does not match the GSTIN on the GSTR-2B entry.",
  ],
  DUPLICATE: [
    "This invoice number and value already appear once elsewhere in the purchase register.",
  ],
};

const SUGGESTED_STEPS: Record<ReconResultType, string[]> = {
  MATCHED: [],
  PARTIAL_MATCH: ["Confirm the differing field with the vendor."],
  AMOUNT_MISMATCH: ["Check the original invoice.", "Check for a related credit/debit note."],
  MISSING_IN_2B: [
    "Confirm the vendor has filed their GSTR-1 for this period.",
    "Contact the vendor if the filing appears delayed.",
  ],
  GSTIN_MISMATCH: ["Verify the vendor's registered GSTIN against their invoice."],
  DUPLICATE: ["Confirm whether this is a genuine duplicate or two separate deliveries."],
};

// Simple, explainable severity rule — not a scoring model. High-value or
// GSTIN-identity issues rank higher than small-value or informational ones.
function severityFor(result: ReconciliationResult, taxableValue: number): ExceptionSeverity {
  if (result.resultType === "GSTIN_MISMATCH") return "HIGH";
  if (result.resultType === "MISSING_IN_2B") return taxableValue >= 50000 ? "HIGH" : "MEDIUM";
  if (result.resultType === "AMOUNT_MISMATCH") {
    const diff = Math.abs(result.differenceAmount ?? 0);
    if (diff >= 5000) return "MEDIUM";
    return "LOW";
  }
  return "LOW";
}

export interface ExceptionDraft {
  exceptionType: ReconResultType;
  severity: ExceptionSeverity;
  whyExplanation: string[];
  aiSuggestedSteps: string[];
}

/** Returns null for MATCHED results — those don't become exceptions. */
export function draftExceptionFromResult(
  result: ReconciliationResult,
  taxableValue: number
): ExceptionDraft | null {
  if (result.resultType === "MATCHED") return null;

  return {
    exceptionType: result.resultType,
    severity: severityFor(result, taxableValue),
    whyExplanation: WHY[result.resultType],
    aiSuggestedSteps: SUGGESTED_STEPS[result.resultType],
  };
}

/** Generates the next display code for a firm, e.g. EX-1042 -> EX-1043. */
export function nextDisplayCode(lastCode: string | null): string {
  if (!lastCode) return "EX-1001";
  const match = lastCode.match(/(\d+)$/);
  const n = match ? parseInt(match[1], 10) + 1 : 1001;
  return `EX-${n}`;
}
