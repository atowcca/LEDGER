import { createClient } from "@/lib/supabase/server";
import { mapUser } from "@/lib/supabase/mappers";
import type { User } from "@/lib/types";

export async function listUsers(): Promise<User[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from("users").select("id, name, role").order("name");
  if (error) throw error;
  return (data ?? []).map((row) => mapUser(row)!).filter(Boolean);
}

/** The signed-in partner/senior/staff member, mapped to the view-model User shape. */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) return null;

  const { data } = await supabase
    .from("users")
    .select("id, name, role")
    .eq("auth_user_id", authUser.id)
    .maybeSingle();
  return mapUser(data);
}
