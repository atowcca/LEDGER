"use client";

// Reached two ways: (1) the link in the reset email, which Supabase's client
// SDK turns into a temporary "recovery" session automatically when this page
// loads, or (2) someone just navigating here directly with no such session.
// We check for that session before showing the form rather than assuming it.
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setHasRecoverySession(!!data.user);
      setChecking(false);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setDone(true);
    setTimeout(() => {
      router.push("/");
      router.refresh();
    }, 1500);
  }

  if (checking) {
    return <div className="flex h-screen items-center justify-center bg-paper" />;
  }

  if (!hasRecoverySession) {
    return (
      <div className="flex h-screen items-center justify-center bg-paper">
        <div className="panel w-full max-w-sm p-6 text-center">
          <h1 className="font-serif text-xl font-semibold text-ink">Link expired or invalid</h1>
          <p className="mt-2 text-sm text-ink-soft">
            This password reset link is no longer valid. Request a new one.
          </p>
          <Link href="/forgot-password" className="btn-primary mt-4 inline-flex">
            Request a new link
          </Link>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="flex h-screen items-center justify-center bg-paper">
        <div className="panel w-full max-w-sm p-6 text-center">
          <h1 className="font-serif text-xl font-semibold text-ink">Password updated</h1>
          <p className="mt-2 text-sm text-ink-soft">Taking you to the dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center bg-paper">
      <div className="panel w-full max-w-sm p-6">
        <h1 className="font-serif text-xl font-semibold text-ink">Set a new password</h1>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-soft">New password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-sm border border-border bg-surface px-3 py-1.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-soft">Confirm password</label>
            <input
              type="password"
              required
              minLength={6}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full rounded-sm border border-border bg-surface px-3 py-1.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          {error && <p className="text-sm text-status-mismatch">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary mt-2">
            {loading ? "Updating…" : "Update password"}
          </button>
        </form>
      </div>
    </div>
  );
}
