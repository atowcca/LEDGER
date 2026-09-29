import type { EvidenceItem } from "@/lib/types";

const ICON: Record<EvidenceItem["status"], string> = {
  RECEIVED: "✓",
  REQUESTED: "…",
  PENDING: "○",
};

const COLOR: Record<EvidenceItem["status"], string> = {
  RECEIVED: "text-status-matched",
  REQUESTED: "text-status-pending",
  PENDING: "text-ink-faint",
};

export function EvidenceChecklist({ evidence }: { evidence: EvidenceItem[] }) {
  return (
    <div className="panel p-4">
      <p className="text-sm font-medium text-ink">Evidence</p>
      <ul className="mt-2 flex flex-col gap-2">
        {evidence.map((item) => (
          <li key={item.id} className="flex items-center gap-2 text-sm">
            <span className={`w-4 text-center font-medium ${COLOR[item.status]}`}>{ICON[item.status]}</span>
            <span className="text-ink">{item.label}</span>
            <span className="ml-auto text-xs text-ink-faint">{item.status.toLowerCase()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
