// GET /api/invites/:token
// Public — the signup page calls this before the invitee has any session, to
// show "You're invited to join <firm>" without exposing anything beyond the
// firm name and role (see getInvitePreview's comment on why this goes
// through the service-role client instead of a direct client-side query).
import { NextRequest, NextResponse } from "next/server";
import { getInvitePreview } from "@/lib/supabase/queries/invites";

export async function GET(_request: NextRequest, { params }: { params: { token: string } }) {
  const preview = await getInvitePreview(params.token);
  return NextResponse.json(preview);
}
