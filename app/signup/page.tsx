"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { completeSignupAction } from "@/app/actions/signup";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [firmName, setFirmName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }
    if (!data.user) {
      setError("Sign-up did not return a user — please try again.");
      setLoading(false);
      return;
    }

    try {
      await completeSignupAction({ authUserId: data.user.id, name, email, firmName });
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
      return;
    }

    if (!data.session) {
      // The Supabase project has email confirmation turned on — there's no
      // session yet, so there's nothing to redirect into.
      setNeedsEmailConfirmation(true);
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  if (needsEmailConfirmation) {
    return (
      <div className="flex h-screen items-center justify-center bg-paper">
        <div className="panel w-full max-w-sm p-6 text-center">
          <h1 className="font-serif text-xl font-semibold text-ink">Check your email</h1>
          <p className="mt-2 text-sm text-ink-soft">
            We've sent a confirmation link to {email}. Follow it, then come back and sign in.
          </p>
          <Link href="/login" className="btn-secondary mt-4 inline-flex">
            Go to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center bg-paper">
      <div className="panel w-full max-w-sm p-6">
        <h1 className="font-serif text-xl font-semibold text-ink">Set up your firm</h1>
        <p className="mt-1 text-sm text-ink-soft">Creates a new firm on CA Ledger, with you as the partner.</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-soft">Your name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Arvind Rao"
              className="w-full rounded-sm border border-border bg-surface px-3 py-1.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-soft">Firm name</label>
            <input
              required
              value={firmName}
              onChange={(e) => setFirmName(e.target.value)}
              placeholder="Northgate & Associates"
              className="w-full rounded-sm border border-border bg-surface px-3 py-1.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-soft">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-sm border border-border bg-surface px-3 py-1.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-soft">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-sm border border-border bg-surface px-3 py-1.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>

          {error && <p className="text-sm text-status-mismatch">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary mt-2">
            {loading ? "Setting up…" : "Create firm"}
          </button>
        </form>

        <p className="mt-6 text-sm text-ink-soft">
          Already have an account?{" "}
          <Link href="/login" className="text-accent hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
