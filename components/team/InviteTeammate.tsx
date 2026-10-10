"use client";

import { useState } from "react";
import { createInviteAction } from "@/app/actions/invites";
import type { UserRole } from "@/lib/supabase/database.types";

export function InviteTeammate() {
  const [role, setRole] = useState<UserRole>("STAFF");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function generate() {
    setLoading(true);
    setError(null);
    setCopied(false);
    try {
      const { url } = await createInviteAction(role);
      const full = url.startsWith("http") ? url : `${window.location.origin}${url}`;
      setLink(full);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopied(true);
  }

  return (
    <div className="panel p-4">
      <p className="text-sm font-medium text-ink">Invite a teammate</p>
      <p className="mt-1 text-sm text-ink-soft">
        Generates a link valid for 7 days. Share it yourself — there's no automatic email.
      </p>

      <div className="mt-3 flex items-center gap-2">
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
          className="rounded-sm border border-border bg-surface px-2 py-1.5 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-accent"
        >
          <option value="STAFF">Staff</option>
          <option value="SENIOR">Senior</option>
          <option value="PARTNER">Partner</option>
        </select>
        <button className="btn-primary" onClick={generate} disabled={loading}>
          {loading ? "Generating…" : "Generate invite link"}
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-status-mismatch">{error}</p>}

      {link && (
        <div className="mt-3 flex items-center gap-2">
          <input
            readOnly
            value={link}
            className="num flex-1 rounded-sm border border-border bg-paper px-3 py-1.5 text-sm text-ink-soft"
            onFocus={(e) => e.target.select()}
          />
          <button className="btn-secondary" onClick={copy}>
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      )}
    </div>
  );
}
