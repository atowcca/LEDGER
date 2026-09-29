// Returns lib/types.ts view models — see lib/supabase/mappers.ts.
// Function names/signatures mirror lib/mock-data.ts so pages that switch
// their import from mock-data to here need no other changes.
import { createClient } from "@/lib/supabase/server";
import { mapClient } from "@/lib/supabase/mappers";
import { fetchAllPages } from "@/lib/supabase/fetch-all";
import type { Client } from "@/lib/types";

export async function listClients(): Promise<Client[]> {
  const supabase = createClient();
  const { data: clients, error } = await supabase.from("clients").select("*").order("name");
  if (error) throw error;
  if (!clients) return [];

  // documentsCount / exceptionsCount / lastActivity need small follow-up
  // aggregate queries — fine at this demo's scale (12 clients).
  const [docCounts, excCounts, lastActivity] = await Promise.all([
    fetchAllPages((from, to) => supabase.from("documents").select("client_id").order("id").range(from, to)),
    fetchAllPages((from, to) => supabase.from("exceptions").select("client_id").order("id").range(from, to)),
    fetchAllPages((from, to) =>
      supabase
        .from("activity_log")
        .select("client_id, created_at")
        .order("created_at", { ascending: false })
        .order("id")
        .range(from, to)
    ),
  ]);

  const docCountByClient = countBy(docCounts, "client_id");
  const excCountByClient = countBy(excCounts, "client_id");
  const lastActivityByClient = new Map<string, string>();
  for (const row of lastActivity) {
    if (!lastActivityByClient.has(row.client_id)) {
      lastActivityByClient.set(row.client_id, row.created_at);
    }
  }

  return clients.map((row) => {
    const view = mapClient(row);
    return {
      ...view,
      documentsCount: docCountByClient.get(row.id) ?? 0,
      exceptionsCount: excCountByClient.get(row.id) ?? 0,
      lastActivity: lastActivityByClient.get(row.id) ?? row.created_at,
    };
  });
}

export async function getClient(slug: string): Promise<Client | undefined> {
  const supabase = createClient();
  const { data: row, error } = await supabase.from("clients").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  if (!row) return undefined;

  const [{ count: documentsCount }, { count: exceptionsCount }] = await Promise.all([
    supabase.from("documents").select("*", { count: "exact", head: true }).eq("client_id", row.id),
    supabase.from("exceptions").select("*", { count: "exact", head: true }).eq("client_id", row.id),
  ]);

  return {
    ...mapClient(row),
    documentsCount: documentsCount ?? 0,
    exceptionsCount: exceptionsCount ?? 0,
  };
}

/** Internal: resolves a client's DB uuid from its URL slug. */
export async function getClientDbId(slug: string): Promise<string | undefined> {
  const supabase = createClient();
  const { data } = await supabase.from("clients").select("id").eq("slug", slug).maybeSingle();
  return data?.id;
}

function countBy<T extends Record<string, unknown>>(rows: T[] | null, key: keyof T) {
  const map = new Map<string, number>();
  for (const row of rows ?? []) {
    const k = row[key] as string;
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return map;
}
