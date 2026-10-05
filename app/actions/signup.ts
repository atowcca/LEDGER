"use server";

// Bootstraps a brand-new firm + its first Partner user, immediately after
// that person's Supabase Auth account is created client-side. Runs with the
// service-role client because there is, by definition, no firm_id yet for
// RLS to scope this insert to — this is the one legitimate bootstrapping
// exception to "always go through RLS". It can only ever CREATE a new firm,
// never attach the caller to an existing one, so it can't be used to join
// or take over another firm.
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export async function completeSignupAction(params: {
  authUserId: string;
  name: string;
  email: string;
  firmName: string;
}) {
  const admin = createServiceRoleClient();

  const { data: firmData, error: firmError } = await (admin
    .from("firms") as any)
    .insert({ name: params.firmName })
    .select("id")
    .single();
  if (firmError) throw new Error(firmError.message);
  const firm = firmData as unknown as { id: string };

  const { error: userError } = await (admin.from("users") as any).insert({
    firm_id: firm.id,
    auth_user_id: params.authUserId,
    name: params.name,
    email: params.email,
    role: "PARTNER",
  });
  if (userError) throw new Error(userError.message);
}
