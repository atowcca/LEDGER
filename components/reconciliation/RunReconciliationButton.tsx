"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function RunReconciliationButton({ clientDbId }: { clientDbId: string }) {
  const router = useRouter();
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setRunning(true);
    setError(null);
    try {
      const res = await fetch("/api/reconciliations/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: clientDbId, period: "August 2026" }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Reconciliation failed.");
      }
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setRunning(false);
    }
  }

  return (
    <div>
      <button className="btn-primary" onClick={run} disabled={running}>
        {running ? "Running…" : "Run reconciliation"}
      </button>
      {error && <p className="mt-2 text-sm text-status-mismatch">{error}</p>}
    </div>
  );
}
