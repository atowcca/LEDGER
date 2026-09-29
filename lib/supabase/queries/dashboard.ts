import { createClient } from "@/lib/supabase/server";
import { getAllExceptions } from "./exceptions";
import type { Client } from "@/lib/types";

export async function getDashboardStats() {
  const supabase = createClient();
  const [{ count: totalClients }, exceptions] = await Promise.all([
    supabase.from("clients").select("*", { count: "exact", head: true }),
    getAllExceptions(),
  ]);

  return {
    totalClients: totalClients ?? 0,
    openExceptions: exceptions.filter((e) => ["OPEN", "ASSIGNED", "UNDER_REVIEW"].includes(e.status)).length,
    awaitingClient: exceptions.filter((e) => e.status === "AWAITING_CLIENT").length,
    partnerReviews: exceptions.filter((e) => e.status === "UNDER_REVIEW").length,
  };
}

/** Top 3 clients by open exception value — the Dashboard's "where to look first" list. */
export async function getPriorityExceptionGroups(): Promise<
  { client: Client; headline: string; value: number }[]
> {
  const supabase = createClient();
  const exceptions = await getAllExceptions();
  const open = exceptions.filter((e) => !["RESOLVED", "REJECTED"].includes(e.status));

  const byClient = new Map<string, { value: number; count: number; type: string }>();
  for (const e of open) {
    const entry = byClient.get(e.clientId) ?? { value: 0, count: 0, type: e.type };
    entry.value += e.difference ?? 0;
    entry.count += 1;
    byClient.set(e.clientId, entry);
  }

  const top = [...byClient.entries()].sort((a, b) => b[1].value - a[1].value).slice(0, 3);
  if (top.length === 0) return [];

  const { data: clients } = await supabase.from("clients").select("*").in(
    "slug",
    top.map(([slug]) => slug)
  );

  const { mapClient } = await import("@/lib/supabase/mappers");
  return top
    .map(([slug, info]) => {
      const row = clients?.find((c) => c.slug === slug);
      if (!row) return null;
      return {
        client: mapClient(row),
        headline: `${info.count} ${info.type.replace(/_/g, " ").toLowerCase()} issue${info.count > 1 ? "s" : ""}`,
        value: info.value,
      };
    })
    .filter((g): g is NonNullable<typeof g> => g !== null);
}
