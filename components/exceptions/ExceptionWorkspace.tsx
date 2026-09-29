"use client";

import { useState, useTransition } from "react";
import { StatusBadge, SeverityBadge } from "@/components/shared/StatusBadge";
import { Money } from "@/components/shared/Money";
import { WhyPanel } from "@/components/exceptions/WhyPanel";
import { EvidenceChecklist } from "@/components/exceptions/EvidenceChecklist";
import { formatDate } from "@/lib/format";
import {
  assignExceptionAction,
  updateStatusAction,
  uploadEvidenceAction,
  sendClarificationAction,
  approveExceptionAction,
  returnForReviewAction,
} from "@/app/actions/exceptions";
import type { ExceptionRecord, ExceptionStatus, User, EvidenceItem, UserRole } from "@/lib/types";

function draftClarification(e: ExceptionRecord): { subject: string; message: string } {
  return {
    subject: `Clarification required for invoice ${e.invoiceNumber}`,
    message: `We identified a difference between the purchase register and GSTR-2B for invoice ${e.invoiceNumber} from ${e.vendorName}.\n\nOur records show a taxable value of ${e.purchaseValue ? `₹${e.purchaseValue.toLocaleString("en-IN")}` : "—"}, while the corresponding GSTR-2B record shows ${e.gstr2bValue ? `₹${e.gstr2bValue.toLocaleString("en-IN")}` : "—"}.\n\nPlease confirm the correct amount and provide any relevant amendment, credit note, or supporting document.`,
  };
}

export function ExceptionWorkspace({
  exception,
  assignableUsers,
  currentUserRole,
}: {
  exception: ExceptionRecord;
  assignableUsers: User[];
  currentUserRole: UserRole | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<ExceptionStatus>(exception.status);
  const [assignedTo, setAssignedTo] = useState<User | null>(exception.assignedTo);
  const [evidence, setEvidence] = useState<EvidenceItem[]>(exception.evidence);
  const [resolvedAt, setResolvedAt] = useState<string | null>(exception.resolvedAt);
  const [showAssignMenu, setShowAssignMenu] = useState(false);
  const [showDraft, setShowDraft] = useState(false);
  const [draftSent, setDraftSent] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const draft = draftClarification(exception);
  const today = new Date().toISOString();

  function runAction(fn: () => Promise<void>) {
    setActionError(null);
    startTransition(async () => {
      try {
        await fn();
      } catch (err) {
        setActionError((err as Error).message);
      }
    });
  }

  function assign(user: User) {
    setAssignedTo(user);
    setShowAssignMenu(false);
    if (status === "OPEN") setStatus("ASSIGNED");
    runAction(() => assignExceptionAction(exception.id, user.id, user.name));
  }

  function sendClarification() {
    setDraftSent(true);
    setStatus("AWAITING_CLIENT");
    runAction(() => sendClarificationAction(exception.id));
  }

  function uploadEvidence() {
    setEvidence((prev) => {
      const idx = prev.findIndex((ev) => ev.status !== "RECEIVED");
      if (idx === -1) return prev;
      const next = [...prev];
      next[idx] = { ...next[idx], status: "RECEIVED" };
      return next;
    });
    runAction(() => uploadEvidenceAction(exception.id));
  }

  function resolve() {
    setStatus("RESOLVED");
    setResolvedAt(today);
    runAction(() => updateStatusAction(exception.id, "RESOLVED"));
  }

  function sendForReview() {
    setStatus("UNDER_REVIEW");
    runAction(() => updateStatusAction(exception.id, "UNDER_REVIEW"));
  }

  function approve() {
    setStatus("RESOLVED");
    if (!resolvedAt) setResolvedAt(today);
    runAction(() => approveExceptionAction(exception.id));
  }

  function returnForReview() {
    const next = assignedTo ? "ASSIGNED" : "OPEN";
    setStatus(next);
    runAction(() => returnForReviewAction(exception.id, next));
  }

  const allEvidenceReceived = evidence.every((ev) => ev.status === "RECEIVED");
  const isPartner = currentUserRole === "PARTNER";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="num text-sm text-ink-soft">Exception {exception.id}</p>
          <div className="mt-1 flex items-center gap-2">
            <h2 className="font-serif text-xl font-semibold text-ink">
              {exception.type.replace(/_/g, " ")}
            </h2>
            <SeverityBadge severity={exception.severity} />
          </div>
          <p className="mt-1 text-sm text-ink-soft">
            {exception.vendorName} · {exception.invoiceNumber}
          </p>
        </div>
        <StatusBadge status={status} />
      </div>

      {actionError && (
        <p className="rounded-sm border border-status-mismatch/30 bg-status-mismatch-bg px-3 py-2 text-sm text-status-mismatch">
          {actionError}
        </p>
      )}

      <div className="grid grid-cols-3 gap-3">
        <div className="panel px-4 py-3">
          <p className="text-xs text-ink-soft">Purchase register</p>
          <Money value={exception.purchaseValue} className="mt-1 block text-lg font-medium text-ink" />
        </div>
        <div className="panel px-4 py-3">
          <p className="text-xs text-ink-soft">GSTR-2B</p>
          <Money value={exception.gstr2bValue} className="mt-1 block text-lg font-medium text-ink" />
        </div>
        <div className="panel px-4 py-3">
          <p className="text-xs text-ink-soft">Difference</p>
          <Money
            value={exception.difference}
            className="mt-1 block text-lg font-medium text-status-mismatch"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 flex flex-col gap-4">
          <WhyPanel
            whyExplanation={exception.whyExplanation}
            aiSuggestedSteps={exception.aiSuggestedSteps}
          />

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <button className="btn-secondary" onClick={() => setShowAssignMenu((v) => !v)}>
                  {assignedTo ? `Reassign (${assignedTo.name.split(" ")[0]})` : "Assign"}
                </button>
                {showAssignMenu && (
                  <div className="absolute left-0 top-full z-10 mt-1 w-44 panel py-1 shadow-sm">
                    {assignableUsers.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => assign(u)}
                        className="block w-full px-3 py-1.5 text-left text-sm text-ink hover:bg-paper"
                      >
                        {u.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button className="btn-secondary" onClick={() => setShowDraft((v) => !v)}>
                Request clarification
              </button>

              <button
                className="btn-secondary"
                onClick={uploadEvidence}
                disabled={allEvidenceReceived || isPending}
              >
                Upload evidence
              </button>

              <button className="btn-secondary" onClick={resolve} disabled={status === "RESOLVED" || isPending}>
                Resolve
              </button>

              <button
                className="btn-primary"
                onClick={sendForReview}
                disabled={status !== "RESOLVED" || isPending}
              >
                Send for review
              </button>
            </div>

            {status === "UNDER_REVIEW" && (
              <div className="mt-3 flex items-center gap-2 rounded-sm border border-status-review/30 bg-status-review-bg px-3 py-2.5">
                <p className="mr-auto text-sm text-status-review">
                  {isPartner ? "Ready for partner decision." : "Sent for partner review — awaiting a decision."}
                </p>
                {isPartner && (
                  <>
                    <button className="btn-secondary" onClick={returnForReview} disabled={isPending}>
                      Return for review
                    </button>
                    <button className="btn-primary" onClick={approve} disabled={isPending}>
                      Approve
                    </button>
                  </>
                )}
              </div>
            )}

            {showDraft && (
              <div className="mt-4 panel p-4">
                <p className="text-xs font-medium text-ink-soft">
                  {draftSent ? "Sent to client" : "Draft — not sent automatically"}
                </p>
                <p className="mt-2 text-sm font-medium text-ink">{draft.subject}</p>
                <p className="mt-2 whitespace-pre-line text-sm text-ink-soft">{draft.message}</p>
                <div className="mt-3 flex gap-2">
                  <button className="btn-secondary">Edit</button>
                  {!draftSent && (
                    <button className="btn-primary" onClick={sendClarification} disabled={isPending}>
                      Send to client
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="panel p-4">
            <p className="text-sm font-medium text-ink">Assigned to</p>
            <p className="mt-1 text-sm text-ink-soft">{assignedTo?.name ?? "Unassigned"}</p>
            <p className="mt-3 text-sm font-medium text-ink">Created</p>
            <p className="mt-1 text-sm text-ink-soft">{formatDate(exception.createdAt)}</p>
            {resolvedAt && (
              <>
                <p className="mt-3 text-sm font-medium text-ink">Resolved</p>
                <p className="mt-1 text-sm text-ink-soft">{formatDate(resolvedAt)}</p>
              </>
            )}
          </div>
          <EvidenceChecklist evidence={evidence} />
        </div>
      </div>
    </div>
  );
}
