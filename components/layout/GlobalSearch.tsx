"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface ClientHit {
  slug: string;
  name: string;
  gstin: string;
}
interface ExceptionHit {
  display_code: string;
  client_slug: string;
  vendor_name: string;
  invoice_number: string;
}

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [clients, setClients] = useState<ClientHit[]>([]);
  const [exceptions, setExceptions] = useState<ExceptionHit[]>([]);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setClients([]);
      setExceptions([]);
      return;
    }
    const supabase = createClient();
    const timeout = setTimeout(async () => {
      const [{ data: clientRows }, { data: exceptionRows }] = await Promise.all([
        supabase.from("clients").select("slug, name, gstin").or(`name.ilike.%${q}%,gstin.ilike.%${q}%`).limit(5),
        supabase
          .from("exceptions")
          .select("display_code, client:clients(slug), transaction:transactions!exceptions_transaction_id_fkey(vendor_name, invoice_number)")
          .or(`display_code.ilike.%${q}%`)
          .limit(5),
      ]);
      setClients(clientRows ?? []);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setExceptions(
        (exceptionRows ?? []).map((r: any) => ({
          display_code: r.display_code,
          client_slug: r.client?.slug ?? "",
          vendor_name: r.transaction?.vendor_name ?? "",
          invoice_number: r.transaction?.invoice_number ?? "",
        }))
      );
    }, 250);
    return () => clearTimeout(timeout);
  }, [query]);

  const hasResults = clients.length > 0 || exceptions.length > 0;

  return (
    <div className="relative">
      <input
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Search clients, exceptions, GSTIN"
        className="w-72 rounded-sm border border-border bg-paper px-3 py-1.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-1 focus:ring-accent"
      />
      {open && query.trim() && (
        <div className="absolute left-0 top-full z-20 mt-1 w-96 panel py-1 shadow-sm">
          {!hasResults && <p className="px-3 py-2 text-sm text-ink-soft">No matches</p>}
          {clients.length > 0 && (
            <div>
              <p className="px-3 pt-1.5 text-xs font-medium text-ink-faint">Clients</p>
              {clients.map((c) => (
                <Link
                  key={c.slug}
                  href={`/clients/${c.slug}`}
                  className="block px-3 py-1.5 text-sm text-ink hover:bg-paper"
                >
                  {c.name} <span className="num text-ink-soft">· {c.gstin}</span>
                </Link>
              ))}
            </div>
          )}
          {exceptions.length > 0 && (
            <div>
              <p className="px-3 pt-1.5 text-xs font-medium text-ink-faint">Exceptions</p>
              {exceptions.map((e) => (
                <Link
                  key={e.display_code}
                  href={`/clients/${e.client_slug}/exceptions/${e.display_code}`}
                  className="block px-3 py-1.5 text-sm text-ink hover:bg-paper"
                >
                  <span className="num">{e.display_code}</span> · {e.vendor_name} ({e.invoice_number})
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
