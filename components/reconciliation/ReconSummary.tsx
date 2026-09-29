import type { ReconciliationSummary } from "@/lib/types";

function Row({ label, value, emphasize = false }: { label: string; value: number; emphasize?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-border px-4 py-2.5 last:border-b-0">
      <span className={`text-sm ${emphasize ? "font-medium text-ink" : "text-ink-soft"}`}>{label}</span>
      <span className={`num text-sm ${emphasize ? "font-medium text-ink" : "text-ink"}`}>{value.toLocaleString("en-IN")}</span>
    </div>
  );
}

export function ReconSummaryPanel({ summary }: { summary: ReconciliationSummary }) {
  const partial = summary.partialMatch ?? 0;
  const totalExceptions =
    partial + summary.amountMismatch + summary.missingIn2B + summary.gstinMismatch + summary.duplicates;

  return (
    <div className="panel">
      <div className="border-b border-border px-4 py-3">
        <p className="text-sm font-medium text-ink">Purchase Register vs GSTR-2B</p>
        <p className="text-sm text-ink-soft">Period: {summary.period}</p>
      </div>
      <Row label="Purchase entries" value={summary.purchaseEntries} emphasize />
      <Row label="Matched" value={summary.matched} />
      {partial > 0 && <Row label="Partial match" value={partial} />}
      <Row label="Amount mismatch" value={summary.amountMismatch} />
      <Row label="Missing in 2B" value={summary.missingIn2B} />
      <Row label="GSTIN mismatch" value={summary.gstinMismatch} />
      <Row label="Duplicates" value={summary.duplicates} />
      <Row label="Total exceptions" value={totalExceptions} emphasize />
    </div>
  );
}
