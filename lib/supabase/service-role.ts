// Service-role client — SERVER ONLY, never import this from a Client Component
// or anywhere that ships to the browser. Bypasses RLS entirely.
//
// Used for: document processing jobs, the reconciliation engine, and any
// other trusted background work that must read/write across firms or
// before a `users` row exists to satisfy the RLS policy.
import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

export function createServiceRoleClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
