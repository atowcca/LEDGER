import type { ExceptionStatus, ReconResultType, ProcessingStatus, ClientStatus } from "@/lib/types";

type BadgeKind = ExceptionStatus | ReconResultType | ProcessingStatus | ClientStatus | "MATCHED_OK";

const STYLES: Record<string, { bg: string; fg: string; border: string; label: string }> = {
  OPEN: { bg: "bg-status-pending-bg", fg: "text-status-pending", border: "border-status-pending", label: "Open" },
  ASSIGNED: { bg: "bg-status-review-bg", fg: "text-status-review", border: "border-status-review", label: "Assigned" },
  AWAITING_CLIENT: { bg: "bg-status-pending-bg", fg: "text-status-pending", border: "border-status-pending", label: "Awaiting client" },
  UNDER_REVIEW: { bg: "bg-status-review-bg", fg: "text-status-review", border: "border-status-review", label: "Under review" },
  RESOLVED: { bg: "bg-status-matched-bg", fg: "text-status-matched", border: "border-status-matched", label: "Resolved" },
  REJECTED: { bg: "bg-status-mismatch-bg", fg: "text-status-mismatch", border: "border-status-mismatch", label: "Rejected" },

  MATCHED: { bg: "bg-status-matched-bg", fg: "text-status-matched", border: "border-status-matched", label: "Matched" },
  PARTIAL_MATCH: { bg: "bg-status-pending-bg", fg: "text-status-pending", border: "border-status-pending", label: "Partial match" },
  AMOUNT_MISMATCH: { bg: "bg-status-mismatch-bg", fg: "text-status-mismatch", border: "border-status-mismatch", label: "Amount mismatch" },
  MISSING_IN_2B: { bg: "bg-status-mismatch-bg", fg: "text-status-mismatch", border: "border-status-mismatch", label: "Missing in 2B" },
  GSTIN_MISMATCH: { bg: "bg-status-mismatch-bg", fg: "text-status-mismatch", border: "border-status-mismatch", label: "GSTIN mismatch" },
  DUPLICATE: { bg: "bg-status-pending-bg", fg: "text-status-pending", border: "border-status-pending", label: "Duplicate" },

  Processing: { bg: "bg-status-review-bg", fg: "text-status-review", border: "border-status-review", label: "Processing" },
  Processed: { bg: "bg-status-matched-bg", fg: "text-status-matched", border: "border-status-matched", label: "Processed" },
  Ready: { bg: "bg-status-matched-bg", fg: "text-status-matched", border: "border-status-matched", label: "Ready" },
  Failed: { bg: "bg-status-mismatch-bg", fg: "text-status-mismatch", border: "border-status-mismatch", label: "Failed" },

  ACTIVE: { bg: "bg-status-matched-bg", fg: "text-status-matched", border: "border-status-matched", label: "Active" },
  ONBOARDING: { bg: "bg-status-review-bg", fg: "text-status-review", border: "border-status-review", label: "Onboarding" },
  PAUSED: { bg: "bg-paper", fg: "text-ink-soft", border: "border-border-strong", label: "Paused" },
};

export function StatusBadge({ status }: { status: BadgeKind }) {
  const s = STYLES[status] ?? { bg: "bg-paper", fg: "text-ink-soft", border: "border-border-strong", label: status };
  return (
    <span className={`status-pill ${s.bg} ${s.fg} ${s.border}`}>
      {s.label}
    </span>
  );
}

export function SeverityBadge({ severity }: { severity: "HIGH" | "MEDIUM" | "LOW" }) {
  const map = {
    HIGH: { fg: "text-status-mismatch", label: "High" },
    MEDIUM: { fg: "text-status-pending", label: "Medium" },
    LOW: { fg: "text-ink-soft", label: "Low" },
  } as const;
  const s = map[severity];
  return <span className={`text-xs font-medium ${s.fg}`}>{s.label}</span>;
}
