import Link from "next/link";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate } from "@/lib/format";
import type { Client } from "@/lib/types";

export function ClientTable({ clients }: { clients: Client[] }) {
  return (
    <table className="w-full panel border-collapse">
      <thead>
        <tr>
          <th className="th-cell">Client</th>
          <th className="th-cell">GSTIN</th>
          <th className="th-cell">Engagement</th>
          <th className="th-cell text-right">Documents</th>
          <th className="th-cell text-right">Exceptions</th>
          <th className="th-cell">Status</th>
          <th className="th-cell">Last activity</th>
        </tr>
      </thead>
      <tbody>
        {clients.map((c) => (
          <tr key={c.id} className="hover:bg-paper">
            <td className="td-cell">
              <Link href={`/clients/${c.id}`} className="font-medium text-ink hover:text-accent">
                {c.name}
              </Link>
            </td>
            <td className="td-cell num text-ink-soft">{c.gstin}</td>
            <td className="td-cell text-ink-soft">{c.engagement}</td>
            <td className="td-cell num text-right">{c.documentsCount}</td>
            <td className="td-cell num text-right">{c.exceptionsCount}</td>
            <td className="td-cell">
              <StatusBadge status={c.status} />
            </td>
            <td className="td-cell text-ink-soft">{formatDate(c.lastActivity)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
