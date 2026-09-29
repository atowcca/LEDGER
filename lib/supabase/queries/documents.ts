import { createClient } from "@/lib/supabase/server";
import { mapDocument } from "@/lib/supabase/mappers";
import type { ClientDocument } from "@/lib/types";

export async function getDocuments(clientId: string): Promise<ClientDocument[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapDocument);
}
