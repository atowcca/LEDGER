"use client";

import { useMemo, useState } from "react";
import { ClientTable } from "@/components/clients/ClientTable";
import type { Client, ClientStatus } from "@/lib/types";

const STATUS_FILTERS: (ClientStatus | "ALL")[] = ["ALL", "ACTIVE", "ONBOARDING", "PAUSED"];
type SortKey = "name" | "exceptionsCount" | "lastActivity";

export function ClientsBrowser({ clients }: { clients: Client[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<ClientStatus | "ALL">("ALL");
  const [sortKey, setSortKey] = useState<SortKey>("exceptionsCount");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = clients.filter(
      (c) =>
        (status === "ALL" || c.status === status) &&
        (!q || c.name.toLowerCase().includes(q) || c.gstin.toLowerCase().includes(q))
    );
    result = [...result].sort((a, b) => {
      if (sortKey === "name") return a.name.localeCompare(b.name);
      if (sortKey === "exceptionsCount") return b.exceptionsCount - a.exceptionsCount;
      return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
    });
    return result;
  }, [clients, query, status, sortKey]);

  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by client name or GSTIN"
          className="w-72 rounded-sm border border-border bg-surface px-3 py-1.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as ClientStatus | "ALL")}
          className="rounded-sm border border-border bg-surface px-2 py-1.5 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-accent"
        >
          {STATUS_FILTERS.map((s) => (
            <option key={s} value={s}>
              {s === "ALL" ? "All statuses" : s.charAt(0) + s.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
          className="rounded-sm border border-border bg-surface px-2 py-1.5 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-accent"
        >
          <option value="exceptionsCount">Sort: most exceptions</option>
          <option value="lastActivity">Sort: recent activity</option>
          <option value="name">Sort: name (A–Z)</option>
        </select>
      </div>
      <ClientTable clients={filtered} />
    </div>
  );
}
