// Plain module (no "use client") so BOTH server pages and client components can
// import it. Exporting this from a "use client" file turns it into a
// browser-only reference that the server cannot read.
import type { ReconResultType } from "@/lib/types";

export const RECON_STATUS_FILTERS: (ReconResultType | "ALL")[] = [
  "ALL",
  "MATCHED",
  "PARTIAL_MATCH",
  "AMOUNT_MISMATCH",
  "MISSING_IN_2B",
  "GSTIN_MISMATCH",
  "DUPLICATE",
];
