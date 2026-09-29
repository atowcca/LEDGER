"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate } from "@/lib/format";
import type { ClientDocument } from "@/lib/types";

export function DocumentTable({ documents }: { documents: ClientDocument[] }) {
  const router = useRouter();
  const [retrying, setRetrying] = useState<string | null>(null);

  async function retry(id: string) {
    setRetrying(id);
    try {
      await fetch(`/api/documents/${id}/retry`, { method: "POST" });
    } finally {
      setRetrying(null);
      router.refresh();
    }
  }

  return (
    <table className="w-full panel border-collapse">
      <thead>
        <tr>
          <th className="th-cell">Document</th>
          <th className="th-cell">Type</th>
          <th className="th-cell">Uploaded</th>
          <th className="th-cell">Processing status</th>
          <th className="th-cell">Extracted data</th>
          <th className="th-cell text-right">Actions</th>
        </tr>
      </thead>
      <tbody>
        {documents.map((d) => (
          <tr key={d.id} className="hover:bg-paper">
            <td className="td-cell font-medium text-ink">{d.fileName}</td>
            <td className="td-cell text-ink-soft">{d.documentType}</td>
            <td className="td-cell text-ink-soft">{formatDate(d.uploadedOn)}</td>
            <td className="td-cell">
              <StatusBadge status={d.processingStatus} />
            </td>
            <td className="td-cell num text-ink-soft">
              {d.extractedConfidence ? `${Math.round(d.extractedConfidence * 100)}% confidence` : "—"}
            </td>
            <td className="td-cell text-right">
              {d.processingStatus === "Failed" ? (
                <button className="btn-ghost" onClick={() => retry(d.id)} disabled={retrying === d.id}>
                  {retrying === d.id ? "Retrying…" : "Retry"}
                </button>
              ) : (
                <button className="btn-ghost">View</button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
