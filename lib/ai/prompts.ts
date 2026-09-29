// AI Architecture Principle (spec section 41): AI interprets. Rules calculate.
// Evidence proves. Humans decide. Everything in this file produces text or
// structured extraction for a human to read/verify — nothing here decides a
// match, a total, or a final accounting status.

export const INVOICE_EXTRACTION_SCHEMA = {
  type: "object",
  properties: {
    document_type: { type: "string" },
    vendor_name: { type: "string", nullable: true },
    vendor_gstin: { type: "string", nullable: true },
    invoice_number: { type: "string", nullable: true },
    invoice_date: { type: "string", nullable: true, description: "YYYY-MM-DD" },
    taxable_value: { type: "number", nullable: true },
    cgst: { type: "number", nullable: true },
    sgst: { type: "number", nullable: true },
    igst: { type: "number", nullable: true },
    total_amount: { type: "number", nullable: true },
    confidence: {
      type: "object",
      properties: {
        vendor_name: { type: "number" },
        vendor_gstin: { type: "number" },
        invoice_number: { type: "number" },
        invoice_date: { type: "number" },
        taxable_value: { type: "number" },
        cgst: { type: "number" },
        sgst: { type: "number" },
        igst: { type: "number" },
        total_amount: { type: "number" },
      },
      required: [
        "vendor_name",
        "vendor_gstin",
        "invoice_number",
        "invoice_date",
        "taxable_value",
        "cgst",
        "sgst",
        "igst",
        "total_amount",
      ],
    },
  },
  required: ["document_type", "confidence"],
} as const;

// Verbatim from spec section 19.
export const INVOICE_EXTRACTION_PROMPT = `You are a financial document extraction engine for an Indian CA workflow system.

Extract structured information from the supplied GST invoice.

Return ONLY valid JSON.

Rules:

- Do not invent missing values.
- Use null when a field cannot be reliably identified.
- Preserve invoice number exactly.
- Return numeric values as numbers.
- Dates must use YYYY-MM-DD.
- Distinguish CGST + SGST from IGST.
- Identify the document type accurately.`;

// Spec section 29 — explaining an already-determined (rule-computed) exception.
// The AI never decides the match here; it only narrates a result the
// deterministic reconciliation engine already produced.
export function buildExceptionExplanationPrompt(input: {
  purchaseRegister: Record<string, unknown>;
  gstr2b: Record<string, unknown> | null;
  difference: number | null;
  exceptionType: string;
}): string {
  return `You are assisting a CA firm's staff in understanding a reconciliation exception.
The match/mismatch decision below was already made by a deterministic rules engine — do not
re-evaluate or second-guess it. Explain what the data shows and suggest verification steps.

Purchase register entry:
${JSON.stringify(input.purchaseRegister, null, 2)}

GSTR-2B entry:
${JSON.stringify(input.gstr2b, null, 2)}

Difference: ${input.difference ?? "N/A"}
Exception type: ${input.exceptionType}

Respond with:
1. A short, plain-language explanation of why this exception was raised (2-4 sentences).
2. A numbered list of 2-4 concrete verification steps for the assigned staff member.
Do not state a final accounting conclusion — only a human reviewer decides that.`;
}

// Spec section 30 — draft-only clarification message. Never sent automatically.
export function buildClarificationDraftPrompt(input: {
  vendorName: string;
  invoiceNumber: string;
  purchaseValue: number | null;
  gstr2bValue: number | null;
}): string {
  return `Draft a brief, polite clarification email to a vendor about a GST reconciliation
difference. Do not accuse the vendor of an error — ask them to confirm and provide
supporting documentation if one exists.

Vendor: ${input.vendorName}
Invoice: ${input.invoiceNumber}
Purchase register value: ${input.purchaseValue ?? "N/A"}
GSTR-2B value: ${input.gstr2bValue ?? "N/A"}

Return a subject line and a message body, 3-5 sentences.`;
}
