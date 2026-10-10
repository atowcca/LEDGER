"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    // Always show the same confirmation whether or not the email exists —
    // don't let this screen reveal which emails have accounts.
    setSent(true);
  }

  if (sent) {
    return (
      <div className="flex h-screen items-center justify-center bg-paper">
        <div className="panel w-full max-w-sm p-6 text-center">
          <h1 className="font-serif text-xl font-semibold text-ink">Check your email</h1>
          <p className="mt-2 text-sm text-ink-soft">
            If an account exists for {email}, we've sent a link to reset the password.
          </p>
          <Link href="/login" className="btn-secondary mt-4 inline-flex">
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center bg-paper">
      <div className="panel w-full max-w-sm p-6">
        <h1 className="font-serif text-xl font-semibold text-ink">Reset your password</h1>
        <p className="mt-1 text-sm text-ink-soft">We'll email you a link to set a new one.</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-soft">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="arvind@northgate.example"
              className="w-full rounded-sm border border-border bg-surface px-3 py-1.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          {error && <p className="text-sm text-status-mismatch">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary mt-2">
            {loading ? "Sending…" : "Send reset link"}
          </button>
        </form>

        <p className="mt-6 text-sm text-ink-soft">
          <Link href="/login" className="text-accent hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
