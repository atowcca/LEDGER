import { createClient } from "@/lib/supabase/server";
import { mapActivity } from "@/lib/supabase/mappers";
import type { ActivityEvent } from "@/lib/types";

export async function getActivity(clientId: string): Promise<ActivityEvent[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("activity_log")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(mapActivity);
}

/** Logs an activity row — called after exception mutations (see app/actions/exceptions.ts). */
export async function logActivity(params: {
  firmId: string;
  clientId: string;
  exceptionId?: string;
  userId?: string;
  action: string;
  description: string;
}) {
  const supabase = createClient();
  const { error } = await supabase.from("activity_log").insert({
    firm_id: params.firmId,
    client_id: params.clientId,
    exception_id: params.exceptionId ?? null,
    user_id: params.userId ?? null,
    action: params.action,
    description: params.description,
  });
  if (error) throw error;
}
