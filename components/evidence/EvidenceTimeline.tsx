import type { ExceptionRecord } from "@/lib/types";

const STAGES = [
  "Source data",
  "Transaction",
  "Reconciliation",
  "Exception",
  "Document",
  "Staff action",
  "Client clarification",
  "Resolution",
  "Partner review",
] as const;

function stageReached(exception: ExceptionRecord, stage: (typeof STAGES)[number]): boolean {
  const order = STAGES.indexOf(stage);
  const statusOrder: Record<string, number> = {
    OPEN: 3,
    ASSIGNED: 5,
    AWAITING_CLIENT: 6,
    UNDER_REVIEW: 8,
    RESOLVED: 7,
    REJECTED: 5,
  };
  return order <= (statusOrder[exception.status] ?? 3);
}

export function EvidenceTimeline({ exception }: { exception: ExceptionRecord }) {
  return (
    <div className="panel p-4">
      <p className="mb-3 text-sm font-medium text-ink">
        {exception.id} — {exception.vendorName} · {exception.invoiceNumber}
      </p>
      <ol className="flex flex-col">
        {STAGES.map((stage, i) => {
          const reached = stageReached(exception, stage);
          return (
            <li key={stage} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    reached ? "bg-status-matched" : "border border-border-strong bg-surface"
                  }`}
                />
                {i < STAGES.length - 1 && <span className="h-6 w-px bg-border" />}
              </div>
              <span className={`-mt-0.5 pb-2 text-sm ${reached ? "text-ink" : "text-ink-faint"}`}>
                {stage}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
