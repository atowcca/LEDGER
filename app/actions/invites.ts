"use server";

import { revalidatePath } from "next/cache";
import { createInvite, acceptInvite } from "@/lib/supabase/queries/invites";
import type { UserRole } from "@/lib/supabase/database.types";

export async function createInviteAction(role: UserRole): Promise<{ url: string }> {
  const token = await createInvite(role);
  revalidatePath("/team");
  // NEXT_PUBLIC_SITE_URL is optional — falls back to a relative path the
  // caller can prefix with window.location.origin if unset.
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  return { url: `${base}/signup?invite=${token}` };
}

export async function completeInviteSignupAction(params: {
  token: string;
  authUserId: string;
  name: string;
  email: string;
}): Promise<void> {
  await acceptInvite(params);
}
