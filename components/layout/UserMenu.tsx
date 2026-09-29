"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function UserMenu({ initials, name }: { initials: string; name: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-soft text-xs font-medium text-accent"
        aria-label={name}
      >
        {initials}
      </button>
      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 w-44 panel py-1 shadow-sm">
          <p className="px-3 py-1.5 text-sm text-ink-soft">{name}</p>
          <button
            onClick={signOut}
            className="block w-full px-3 py-1.5 text-left text-sm text-ink hover:bg-paper"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
