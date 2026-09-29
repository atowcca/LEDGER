"use client";

// Server-driven table: page, status filter, and search live in the URL and are
// applied by the database (see getReconRows). The browser only ever holds one
// page of rows, so this stays fast at 2,500+ rows and isn't subject to the
// 1,000-row API cap.
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Money } from "@/components/shared/Money";
import { formatDate } from "@/lib/format";
import { RECON_STATUS_FILTERS } from "@/lib/reconciliation/status-filters";
import type { ReconciliationRow, ReconResultType } from "@/lib/types";


export function ReconTable({
  rows,
  total,
  page,
  pageSize,
  status,
  search,
  clientId,
  exceptionsByInvoice = {},
}: {
  rows: ReconciliationRow[];
  total: number;
  page: number;
  pageSize: number;
  status: ReconResultType | "ALL";
  search: string;
  clientId: string;
  exceptionsByInvoice?: Record<string, string>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchText, setSearchText] = useState(search);

  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  function update(next: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value === null || value === "") params.delete(key);
      else params.set(key, value);
    }
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  // Debounce typing so we don't query on every keystroke.
  useEffect(() => {
    if (searchText === search) return;
    const timeout = setTimeout(() => update({ q: searchText, page: null }), 350);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <input
          type="search"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search vendor or invoice"
          className="w-64 rounded-sm border border-border bg-surface px-3 py-1.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <select
          value={status}
          onChange={(e) => update({ status: e.target.value === "ALL" ? null : e.target.value, page: null })}
          className="rounded-sm border border-border bg-surface px-2 py-1.5 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-accent"
        >
          {RECON_STATUS_FILTERS.map((s) => (
            <option key={s} value={s}>
              {s === "ALL" ? "All statuses" : s.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>

      <table className="w-full panel border-collapse">
        <thead>
          <tr>
            <th className="th-cell">Vendor</th>
            <th className="th-cell">GSTIN</th>
            <th className="th-cell">Invoice</th>
            <th className="th-cell">Date</th>
            <th className="th-cell text-right">Purchase value</th>
            <th className="th-cell text-right">2B value</th>
            <th className="th-cell text-right">Difference</th>
            <th className="th-cell">Status</th>
            <th className="th-cell text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={9} className="td-cell text-center text-ink-soft">
                No reconciliation rows match these filters.
              </td>
            </tr>
          )}
          {rows.map((r) => (
            <tr key={r.id} className="hover:bg-paper">
              <td className="td-cell font-medium text-ink">{r.vendorName}</td>
              <td className="td-cell num text-ink-soft">{r.vendorGstin}</td>
              <td className="td-cell num text-ink-soft">{r.invoiceNumber}</td>
              <td className="td-cell text-ink-soft">{formatDate(r.invoiceDate)}</td>
              <td className="td-cell text-right">
                <Money value={r.purchaseValue} />
              </td>
              <td className="td-cell text-right">
                <Money value={r.gstr2bValue} />
              </td>
              <td className="td-cell text-right">
                <Money value={r.difference} className={r.difference ? "text-status-mismatch" : ""} />
              </td>
              <td className="td-cell">
                <StatusBadge status={r.status} />
              </td>
              <td className="td-cell text-right">
                {r.status !== "MATCHED" ? (
                  <Link
                    href={
                      exceptionsByInvoice[r.invoiceNumber]
                        ? `/clients/${clientId}/exceptions/${exceptionsByInvoice[r.invoiceNumber]}`
                        : `/clients/${clientId}/exceptions`
                    }
                    className="btn-ghost"
                  >
                    View exception
                  </Link>
                ) : (
                  <span className="text-sm text-ink-faint">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {total > 0 && (
        <div className="mt-3 flex items-center justify-between">
          <p className="text-sm text-ink-soft">
            {((page - 1) * pageSize + 1).toLocaleString("en-IN")}–
            {Math.min(total, page * pageSize).toLocaleString("en-IN")} of {total.toLocaleString("en-IN")}
            <span className="ml-3 text-ink-faint">
              Page {page.toLocaleString("en-IN")} of {pageCount.toLocaleString("en-IN")}
            </span>
          </p>
          <div className="flex gap-2">
            <button
              className="btn-secondary"
              disabled={page <= 1}
              onClick={() => update({ page: page - 1 <= 1 ? null : String(page - 1) })}
            >
              Previous
            </button>
            <button
              className="btn-secondary"
              disabled={page >= pageCount}
              onClick={() => update({ page: String(page + 1) })}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
