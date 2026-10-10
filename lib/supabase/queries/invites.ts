import { randomBytes } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import type { UserRole } from "@/lib/supabase/database.types";

interface InviteRow {
  id: string;
  firm_id: string;
  token: string;
  role: UserRole;
  expires_at: string;
  accepted_at: string | null;
}

/** Partner-only — creates an invite for their own firm, scoped by RLS. */
export async function createInvite(role: UserRole): Promise<string> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");

  const { data: meData } = await supabase
    .from("users")
    .select("id, firm_id, role")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  const me = meData as unknown as { id: string; firm_id: string; role: UserRole } | null;
  if (!me) throw new Error("No matching users row for this session.");
  if (me.role !== "PARTNER") throw new Error("Only a partner can invite teammates.");

  const token = randomBytes(24).toString("hex");
  const { error } = await (supabase.from("invites") as any).insert({
    firm_id: me.firm_id,
    token,
    role,
    invited_by: me.id,
  });
  if (error) throw new Error(error.message);

  return token;
}

/**
 * Public lookup by token — used by the signup page before the invitee has
 * any session, so it goes through the service-role client rather than RLS
 * (no anon policy exists for this table; see migration 0008's comment).
 * Only returns what's safe to show someone who merely holds the token.
 */
export async function getInvitePreview(
  token: string
): Promise<{ valid: boolean; firmName?: string; role?: UserRole; reason?: string }> {
  const admin = createServiceRoleClient();
  const { data } = await admin
    .from("invites")
    .select("id, role, expires_at, accepted_at, firm:firms(name)")
    .eq("token", token)
    .maybeSingle();

  const invite = data as unknown as
    | { id: string; role: UserRole; expires_at: string; accepted_at: string | null; firm: { name: string } | null }
    | null;

  if (!invite) return { valid: false, reason: "This invite link isn't valid." };
  if (invite.accepted_at) return { valid: false, reason: "This invite has already been used." };
  if (new Date(invite.expires_at) < new Date()) {
    return { valid: false, reason: "This invite link has expired." };
  }
  return { valid: true, firmName: invite.firm?.name, role: invite.role };
}

/**
 * Accepts an invite for a brand-new Auth user — same bootstrapping exception
 * as signup (see app/actions/signup.ts): no firm_id exists yet for RLS to
 * scope to, so this runs with the service-role client. Re-validates the
 * invite server-side rather than trusting whatever the client last saw.
 */
export async function acceptInvite(params: {
  token: string;
  authUserId: string;
  name: string;
  email: string;
}): Promise<void> {
  const admin = createServiceRoleClient();

  const { data } = await admin
    .from("invites")
    .select("id, firm_id, role, expires_at, accepted_at")
    .eq("token", params.token)
    .maybeSingle();
  const invite = data as unknown as InviteRow | null;

  if (!invite) throw new Error("This invite link isn't valid.");
  if (invite.accepted_at) throw new Error("This invite has already been used.");
  if (new Date(invite.expires_at) < new Date()) throw new Error("This invite link has expired.");

  const { error: userError } = await (admin.from("users") as any).insert({
    firm_id: invite.firm_id,
    auth_user_id: params.authUserId,
    name: params.name,
    email: params.email,
    role: invite.role,
  });
  if (userError) throw new Error(userError.message);

  const { data: newUser } = await admin
    .from("users")
    .select("id")
    .eq("auth_user_id", params.authUserId)
    .maybeSingle();
  const acceptedBy = (newUser as unknown as { id: string } | null)?.id ?? null;

  await (admin.from("invites") as any)
    .update({ accepted_at: new Date().toISOString(), accepted_by: acceptedBy })
    .eq("id", invite.id);
}
