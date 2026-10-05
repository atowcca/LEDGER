import { createClient } from "@/lib/supabase/server";

/** Advances the next non-Received evidence item for an exception to Received. */
export async function markNextEvidenceReceived(displayCode: string): Promise<void> {
  const supabase = createClient();
  const { data: exceptionRow } = await supabase
    .from("exceptions")
    .select("id")
    .eq("display_code", displayCode)
    .maybeSingle();
  const exception = exceptionRow as unknown as { id: string } | null;
  if (!exception) throw new Error("Exception not found");

  const { data: pendingRow } = await supabase
    .from("evidence")
    .select("id")
    .eq("exception_id", exception.id)
    .neq("status", "RECEIVED")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  const pending = pendingRow as unknown as { id: string } | null;
  if (!pending) return; // nothing left to advance

  const { error } = await (supabase.from("evidence") as any).update({ status: "RECEIVED" }).eq("id", pending.id);
  if (error) throw error;
}
