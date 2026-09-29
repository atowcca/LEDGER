// Gemini client — server only. Uses the current unified @google/genai SDK
// (not the deprecated @google/generative-ai package).
//
// Model pinned via env so it can be bumped without a code change as Google's
// lineup moves; gemini-3.5-flash-lite is the current (Sept 2026) recommended
// model for high-volume, low-latency extraction tasks like invoice OCR. If
// extraction accuracy needs to improve, try gemini-3.8-flash instead — see
// README's "Batch 3" note for how to swap it.
import "server-only";
import { GoogleGenAI } from "@google/genai";
import { INVOICE_EXTRACTION_PROMPT, INVOICE_EXTRACTION_SCHEMA } from "./prompts";
import type { InvoiceExtraction } from "./types";

const DEFAULT_MODEL = "gemini-3.5-flash-lite";

function getClient() {
  const apiKey = process.env.GOOGLE_AI_STUDIO_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_AI_STUDIO_API_KEY is not set.");
  }
  return new GoogleGenAI({ apiKey });
}

/**
 * Extracts structured fields from a GST invoice image/PDF.
 * Never invents values, never decides reconciliation status — see
 * lib/ai/prompts.ts and spec section 17 ("AI should NOT be responsible for
 * financial reconciliation calculations").
 */
export async function extractInvoiceData(
  fileBuffer: Buffer,
  mimeType: string
): Promise<InvoiceExtraction> {
  const ai = getClient();
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;

  const response = await ai.models.generateContent({
    model,
    contents: [
      {
        role: "user",
        parts: [
          { text: INVOICE_EXTRACTION_PROMPT },
          {
            inlineData: {
              mimeType,
              data: fileBuffer.toString("base64"),
            },
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: INVOICE_EXTRACTION_SCHEMA,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Gemini returned an empty extraction response.");
  }

  let parsed: InvoiceExtraction;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("Gemini did not return valid JSON for invoice extraction.");
  }

  return parsed;
}

/** Overall confidence = average of the per-field confidence scores. */
export function averageConfidence(extraction: InvoiceExtraction): number {
  const values = Object.values(extraction.confidence ?? {});
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}
