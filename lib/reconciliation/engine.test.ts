import { describe, it, expect } from "vitest";
import { reconcile, summarize } from "./engine";
import type { ReconciliationTransaction } from "./types";

function txn(overrides: Partial<ReconciliationTransaction>): ReconciliationTransaction {
  return {
    id: overrides.id ?? Math.random().toString(36).slice(2),
    vendorName: "Test Vendor",
    vendorGstin: "27AABCC5678K1Z2",
    invoiceNumber: "INV-1",
    invoiceDate: "2026-08-05",
    taxableValue: 10000,
    cgst: 900,
    sgst: 900,
    igst: 0,
    totalAmount: 11800,
    ...overrides,
  };
}

describe("reconcile", () => {
  it("marks an identical entry as MATCHED", () => {
    const purchase = [txn({ id: "p1" })];
    const gstr2b = [txn({ id: "b1" })];
    const [result] = reconcile(purchase, gstr2b);
    expect(result.resultType).toBe("MATCHED");
    expect(result.matchedTransactionId).toBe("b1");
    expect(result.differenceAmount).toBe(0);
  });

  it("tolerates whitespace/case/punctuation differences in GSTIN and invoice number", () => {
    const purchase = [txn({ id: "p1", vendorGstin: " 27aabcc5678k1z2 ", invoiceNumber: "inv-1" })];
    const gstr2b = [txn({ id: "b1", vendorGstin: "27AABCC5678K1Z2", invoiceNumber: "INV1" })];
    const [result] = reconcile(purchase, gstr2b);
    expect(result.resultType).toBe("MATCHED");
  });

  it("reproduces the spec's canonical ₹8,000 AMOUNT_MISMATCH example", () => {
    const purchase = [
      txn({
        id: "p1",
        vendorGstin: "27AABCC5678K1Z2",
        invoiceNumber: "INV-10482",
        taxableValue: 100000,
        cgst: 9000,
        sgst: 9000,
      }),
    ];
    const gstr2b = [
      txn({
        id: "b1",
        vendorGstin: "27AABCC5678K1Z2",
        invoiceNumber: "INV-10482",
        taxableValue: 92000,
        cgst: 8280,
        sgst: 8280,
      }),
    ];
    const [result] = reconcile(purchase, gstr2b);
    expect(result.resultType).toBe("AMOUNT_MISMATCH");
    expect(result.differenceAmount).toBe(8000);
  });

  it("flags a purchase entry with no GSTR-2B match as MISSING_IN_2B", () => {
    const purchase = [txn({ id: "p1", invoiceNumber: "INV-2201" })];
    const gstr2b: ReconciliationTransaction[] = [];
    const [result] = reconcile(purchase, gstr2b);
    expect(result.resultType).toBe("MISSING_IN_2B");
    expect(result.matchedTransactionId).toBeNull();
  });

  it("flags matching invoice number + amount but different GSTIN as GSTIN_MISMATCH", () => {
    const purchase = [txn({ id: "p1", vendorGstin: "27AABCC5678K1Z2", invoiceNumber: "INV-341" })];
    const gstr2b = [txn({ id: "b1", vendorGstin: "07AAKEL2233Q1Z1", invoiceNumber: "INV-341" })];
    const [result] = reconcile(purchase, gstr2b);
    expect(result.resultType).toBe("GSTIN_MISMATCH");
  });

  it("flags a repeated purchase register entry as DUPLICATE", () => {
    const purchase = [
      txn({ id: "p1", invoiceNumber: "INV-8821", taxableValue: 189000 }),
      txn({ id: "p2", invoiceNumber: "INV-8821", taxableValue: 189000 }),
    ];
    const gstr2b = [txn({ id: "b1", invoiceNumber: "INV-8821", taxableValue: 189000 })];
    const results = reconcile(purchase, gstr2b);
    expect(results[0].resultType).toBe("MATCHED");
    expect(results[1].resultType).toBe("DUPLICATE");
  });

  it("flags matching amount with a differing date as PARTIAL_MATCH", () => {
    const purchase = [txn({ id: "p1", invoiceDate: "2026-08-05" })];
    const gstr2b = [txn({ id: "b1", invoiceDate: "2026-08-06" })];
    const [result] = reconcile(purchase, gstr2b);
    expect(result.resultType).toBe("PARTIAL_MATCH");
  });

  it("summarizes counts by result type", () => {
    const purchase = [
      txn({ id: "p1", invoiceNumber: "INV-1" }),
      txn({ id: "p2", invoiceNumber: "INV-2", taxableValue: 5000 }),
    ];
    const gstr2b = [txn({ id: "b1", invoiceNumber: "INV-1" })];
    const summary = summarize(reconcile(purchase, gstr2b));
    expect(summary.purchaseEntries).toBe(2);
    expect(summary.matched).toBe(1);
    expect(summary.missingIn2B).toBe(1);
  });
});
