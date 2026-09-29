"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { assignException, updateExceptionStatus } from "@/lib/supabase/queries/exceptions";
import { markNextEvidenceReceived } from "@/lib/supabase/queries/evidence";
import { logActivity } from "@/lib/supabase/queries/activity";
import type { ExceptionStatus } from "@/lib/types";

async function currentActor() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");
  const { data: me } = await supabase
    .from("users")
    .select("id, firm_id, name, role")
    .eq("auth_user_id", user.id)
    .maybeSingle();
  if (!me) throw new Error("No matching users row for this session.");
  return me;
}

async function getExceptionContext(displayCode: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("exceptions")
    .select("id, client_id, client:clients(slug)")
    .eq("display_code", displayCode)
    .maybeSingle();
  return data;
}

function revalidateException(clientSlug: string, displayCode: string) {
  revalidatePath(`/clients/${clientSlug}/exceptions/${displayCode}`);
  revalidatePath(`/clients/${clientSlug}/exceptions`);
  revalidatePath(`/clients/${clientSlug}/activity`);
  revalidatePath(`/clients/${clientSlug}/tasks`);
  revalidatePath("/review");
  revalidatePath("/");
}

export async function assignExceptionAction(displayCode: string, userId: string, userName: string) {
  const actor = await currentActor();
  const ctx = await getExceptionContext(displayCode);
  if (!ctx) throw new Error("Exception not found");

  await assignException(displayCode, userId);
  await logActivity({
    firmId: actor.firm_id,
    clientId: ctx.client_id,
    exceptionId: ctx.id,
    userId: actor.id,
    action: "ASSIGNED",
    description: `Exception ${displayCode} assigned to ${userName}`,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  revalidateException((ctx.client as any)?.slug, displayCode);
}

export async function updateStatusAction(displayCode: string, status: ExceptionStatus) {
  const actor = await currentActor();
  const ctx = await getExceptionContext(displayCode);
  if (!ctx) throw new Error("Exception not found");

  await updateExceptionStatus(displayCode, status);
  await logActivity({
    firmId: actor.firm_id,
    clientId: ctx.client_id,
    exceptionId: ctx.id,
    userId: actor.id,
    action: status,
    description: `Exception ${displayCode} marked ${status.replace(/_/g, " ").toLowerCase()}`,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  revalidateException((ctx.client as any)?.slug, displayCode);
}

// Approve/Return are partner-only (spec section 8.1/33: partners sign off on
// review, staff/senior don't). Distinct from updateStatusAction's generic
// "Resolve" transition, which any assignee can do for their own work — the
// role check lives here, server-side, not just in which buttons the UI shows.
async function requirePartner() {
  const actor = await currentActor();
  if (actor.role !== "PARTNER") {
    throw new Error("Only a partner can do that.");
  }
  return actor;
}

export async function approveExceptionAction(displayCode: string) {
  const actor = await requirePartner();
  const ctx = await getExceptionContext(displayCode);
  if (!ctx) throw new Error("Exception not found");

  await updateExceptionStatus(displayCode, "RESOLVED");
  await logActivity({
    firmId: actor.firm_id,
    clientId: ctx.client_id,
    exceptionId: ctx.id,
    userId: actor.id,
    action: "APPROVED",
    description: `Exception ${displayCode} approved by ${actor.name}`,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  revalidateException((ctx.client as any)?.slug, displayCode);
}

export async function returnForReviewAction(displayCode: string, nextStatus: "OPEN" | "ASSIGNED") {
  const actor = await requirePartner();
  const ctx = await getExceptionContext(displayCode);
  if (!ctx) throw new Error("Exception not found");

  await updateExceptionStatus(displayCode, nextStatus);
  await logActivity({
    firmId: actor.firm_id,
    clientId: ctx.client_id,
    exceptionId: ctx.id,
    userId: actor.id,
    action: "RETURNED",
    description: `Exception ${displayCode} returned for further work by ${actor.name}`,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  revalidateException((ctx.client as any)?.slug, displayCode);
}

export async function uploadEvidenceAction(displayCode: string) {
  const actor = await currentActor();
  const ctx = await getExceptionContext(displayCode);
  if (!ctx) throw new Error("Exception not found");

  await markNextEvidenceReceived(displayCode);
  await logActivity({
    firmId: actor.firm_id,
    clientId: ctx.client_id,
    exceptionId: ctx.id,
    userId: actor.id,
    action: "EVIDENCE_RECEIVED",
    description: `Evidence attached for exception ${displayCode}`,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  revalidateException((ctx.client as any)?.slug, displayCode);
}

export async function sendClarificationAction(displayCode: string) {
  const actor = await currentActor();
  const ctx = await getExceptionContext(displayCode);
  if (!ctx) throw new Error("Exception not found");

  await updateExceptionStatus(displayCode, "AWAITING_CLIENT");
  await logActivity({
    firmId: actor.firm_id,
    clientId: ctx.client_id,
    exceptionId: ctx.id,
    userId: actor.id,
    action: "CLARIFICATION_REQUESTED",
    description: `Client clarification requested for exception ${displayCode}`,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  revalidateException((ctx.client as any)?.slug, displayCode);
}
