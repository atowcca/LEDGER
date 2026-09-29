// Deterministic reconciliation engine — Purchase Register vs GSTR-2B.
//
// Spec section 21: "Do NOT use an LLM for matching." This file is pure,
// synchronous TypeScript with no external calls, so it's fully unit-testable
// (see engine.test.ts) and its output is reproducible given the same input.
//
// AI Architecture Principle (spec section 41): AI interprets, rules
// calculate. This is the "rules calculate" half.

import {
  normalizeGstin,
  normalizeInvoiceNumber,
  normalizeDate,
  amountsMatch,
} from "./normalize";
import type {
  ReconciliationTransaction,
  ReconciliationResult,
  ReconciliationSummary,
  ReconResultType,
} from "./types";

interface NormalizedTxn {
  original: ReconciliationTransaction;
  gstin: string;
  invoiceKey: string;
  date: string;
}

function normalize(txn: ReconciliationTransaction): NormalizedTxn {
  return {
    original: txn,
    gstin: normalizeGstin(txn.vendorGstin),
    invoiceKey: normalizeInvoiceNumber(txn.invoiceNumber),
    date: normalizeDate(txn.invoiceDate),
  };
}

/**
 * Matches each purchase register entry against GSTR-2B and classifies it.
 * One result per purchase register row — a GSTR-2B entry with no
 * corresponding purchase register row is out of scope for this MVP (the
 * spec's own result types are all purchase-register-centric).
 */
export function reconcile(
  purchaseRegister: ReconciliationTransaction[],
  gstr2b: ReconciliationTransaction[]
): ReconciliationResult[] {
  const purchase = purchaseRegister.map(normalize);
  const twoB = gstr2b.map(normalize);

  // Primary index: exact (GSTIN, invoice number) match.
  const byGstinAndInvoice = new Map<string, NormalizedTxn>();
  // Secondary index: invoice number only, for GSTIN-mismatch detection.
  const byInvoiceOnly = new Map<string, NormalizedTxn>();
  for (const txn of twoB) {
    byGstinAndInvoice.set(`${txn.gstin}::${txn.invoiceKey}`, txn);
    if (!byInvoiceOnly.has(txn.invoiceKey)) {
      byInvoiceOnly.set(txn.invoiceKey, txn);
    }
  }

  // Duplicate detection within the purchase register itself: same GSTIN +
  // invoice number + taxable value appearing more than once.
  const seenPurchaseKeys = new Set<string>();

  const results: ReconciliationResult[] = [];

  for (const txn of purchase) {
    const dupeKey = `${txn.gstin}::${txn.invoiceKey}::${txn.original.taxableValue}`;
    if (seenPurchaseKeys.has(dupeKey)) {
      results.push({
        purchaseTransactionId: txn.original.id,
        matchedTransactionId: null,
        resultType: "DUPLICATE",
        differenceAmount: null,
        explanation:
          "This invoice number and value already appear once elsewhere in the purchase register for this period.",
      });
      continue;
    }
    seenPurchaseKeys.add(dupeKey);

    const exact = byGstinAndInvoice.get(`${txn.gstin}::${txn.invoiceKey}`);
    if (exact) {
      const dateMatches = exact.date === txn.date;
      const valueMatches = amountsMatch(txn.original.taxableValue, exact.original.taxableValue);
      const taxMatches =
        amountsMatch(txn.original.cgst, exact.original.cgst) &&
        amountsMatch(txn.original.sgst, exact.original.sgst) &&
        amountsMatch(txn.original.igst, exact.original.igst);

      if (dateMatches && valueMatches && taxMatches) {
        results.push({
          purchaseTransactionId: txn.original.id,
          matchedTransactionId: exact.original.id,
          resultType: "MATCHED",
          differenceAmount: 0,
          explanation: "Vendor GSTIN, invoice number, date, and amount all match.",
        });
      } else if (!dateMatches && valueMatches && taxMatches) {
        results.push({
          purchaseTransactionId: txn.original.id,
          matchedTransactionId: exact.original.id,
          resultType: "PARTIAL_MATCH",
          differenceAmount: 0,
          explanation:
            "Vendor GSTIN, invoice number, and amount match, but the invoice date differs.",
        });
      } else {
        const difference = round2(txn.original.taxableValue - exact.original.taxableValue);
        results.push({
          purchaseTransactionId: txn.original.id,
          matchedTransactionId: exact.original.id,
          resultType: "AMOUNT_MISMATCH",
          differenceAmount: difference,
          explanation: `Vendor GSTIN, invoice number, and date match. Taxable amount differs by ₹${Math.abs(
            difference
          ).toLocaleString("en-IN")}.`,
        });
      }
      continue;
    }

    const invoiceOnly = byInvoiceOnly.get(txn.invoiceKey);
    if (invoiceOnly) {
      results.push({
        purchaseTransactionId: txn.original.id,
        matchedTransactionId: invoiceOnly.original.id,
        resultType: "GSTIN_MISMATCH",
        differenceAmount: round2(txn.original.taxableValue - invoiceOnly.original.taxableValue),
        explanation:
          "Invoice number and amount match, but the vendor GSTIN on the purchase register does not match the GSTIN on the GSTR-2B entry.",
      });
      continue;
    }

    results.push({
      purchaseTransactionId: txn.original.id,
      matchedTransactionId: null,
      resultType: "MISSING_IN_2B",
      differenceAmount: null,
      explanation: "Invoice appears in the purchase register but has no matching entry in GSTR-2B.",
    });
  }

  return results;
}

export function summarize(results: ReconciliationResult[]): ReconciliationSummary {
  const counts: Record<ReconResultType, number> = {
    MATCHED: 0,
    PARTIAL_MATCH: 0,
    AMOUNT_MISMATCH: 0,
    MISSING_IN_2B: 0,
    GSTIN_MISMATCH: 0,
    DUPLICATE: 0,
  };
  for (const r of results) counts[r.resultType]++;

  return {
    purchaseEntries: results.length,
    matched: counts.MATCHED,
    partialMatch: counts.PARTIAL_MATCH,
    amountMismatch: counts.AMOUNT_MISMATCH,
    missingIn2B: counts.MISSING_IN_2B,
    gstinMismatch: counts.GSTIN_MISMATCH,
    duplicates: counts.DUPLICATE,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
