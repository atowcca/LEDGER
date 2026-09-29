"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { StatusBadge, SeverityBadge } from "@/components/shared/StatusBadge";
import { Money } from "@/components/shared/Money";
import { formatDate } from "@/lib/format";
import type { ExceptionRecord, ExceptionStatus } from "@/lib/types";

const PAGE_SIZE = 25;

const STATUS_FILTERS: (ExceptionStatus | "ALL")[] = [
  "ALL",
  "OPEN",
  "ASSIGNED",
  "AWAITING_CLIENT",
  "UNDER_REVIEW",
  "RESOLVED",
  "REJECTED",
];

export function ExceptionTable({
  exceptions,
  showClient = false,
}: {
  exceptions: ExceptionRecord[];
  showClient?: boolean;
}) {
  const [status, setStatus] = useState<ExceptionStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () => exceptions.filter((e) => status === "ALL" || e.status === status),
    [exceptions, status]
  );

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const detailHref = (e: ExceptionRecord) =>
    showClient ? `/clients/${e.clientId}/exceptions/${e.id}` : `${e.id}`;

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as ExceptionStatus | "ALL");
            setPage(1);
          }}
          className="rounded-sm border border-border bg-surface px-2 py-1.5 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-accent"
        >
          {STATUS_FILTERS.map((s) => (
            <option key={s} value={s}>
              {s === "ALL" ? "All statuses" : s.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>

      <table className="w-full panel border-collapse">
        <thead>
          <tr>
            <th className="th-cell">Exception</th>
            {showClient && <th className="th-cell">Client</th>}
            <th className="th-cell">Vendor / Invoice</th>
            <th className="th-cell">Type</th>
            <th className="th-cell">Severity</th>
            <th className="th-cell text-right">Difference</th>
            <th className="th-cell">Assigned to</th>
            <th className="th-cell">Status</th>
          </tr>
        </thead>
        <tbody>
          {visible.map((e) => (
            <tr key={e.id} className="hover:bg-paper">
              <td className="td-cell">
                <Link href={detailHref(e)} className="num font-medium text-ink hover:text-accent">
                  {e.id}
                </Link>
              </td>
              {showClient && <td className="td-cell text-ink-soft">{e.clientName}</td>}
              <td className="td-cell">
                <p className="text-ink">{e.vendorName}</p>
                <p className="num text-xs text-ink-soft">{e.invoiceNumber} · {formatDate(e.invoiceDate)}</p>
              </td>
              <td className="td-cell">
                <StatusBadge status={e.type} />
              </td>
              <td className="td-cell">
                <SeverityBadge severity={e.severity} />
              </td>
              <td className="td-cell text-right">
                <Money value={e.difference} className={e.difference ? "text-status-mismatch" : ""} />
              </td>
              <td className="td-cell text-ink-soft">{e.assignedTo?.name ?? "Unassigned"}</td>
              <td className="td-cell">
                <StatusBadge status={e.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {filtered.length > PAGE_SIZE && (
        <div className="mt-3 flex items-center justify-between">
          <p className="text-sm text-ink-soft">
            {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(filtered.length, currentPage * PAGE_SIZE)} of {filtered.length}
          </p>
          <div className="flex gap-2">
            <button className="btn-secondary" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}>
              Previous
            </button>
            <button className="btn-secondary" disabled={currentPage >= pageCount} onClick={() => setPage(currentPage + 1)}>
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
