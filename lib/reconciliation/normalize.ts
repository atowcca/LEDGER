// Normalization only — spec section 22 explicitly warns against building
// "overly sophisticated fuzzy matching" for this MVP. Whitespace, case, and
// punctuation differences are normalized; nothing else is guessed at.

export function normalizeGstin(gstin: string): string {
  return gstin.trim().toUpperCase().replace(/\s+/g, "");
}

export function normalizeInvoiceNumber(invoiceNumber: string): string {
  return invoiceNumber
    .trim()
    .toUpperCase()
    .replace(/[\s\-_/.]+/g, ""); // strip whitespace and common separators
}

export function normalizeDate(date: string): string {
  // Assumes input is already a parseable date string; normalizes to YYYY-MM-DD.
  return new Date(date).toISOString().slice(0, 10);
}

/** ₹1 tolerance absorbs paisa-level rounding differences between sources. */
export const AMOUNT_TOLERANCE = 1;

export function amountsMatch(a: number, b: number): boolean {
  return Math.abs(a - b) <= AMOUNT_TOLERANCE;
}
