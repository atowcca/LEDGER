import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { ExceptionTable } from "@/components/exceptions/ExceptionTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatCompactINR } from "@/lib/format";
import { getAllExceptions, listExceptionsForReview } from "@/lib/supabase/queries/exceptions";
import { getCurrentUser } from "@/lib/supabase/queries/users";

export default async function ReviewPage() {
  const currentUser = await getCurrentUser();
  if (currentUser?.role !== "PARTNER") {
    redirect("/");
  }

  const [all, queue] = await Promise.all([getAllExceptions(), listExceptionsForReview()]);

  const forReview = queue.filter((e) => e.status === "UNDER_REVIEW");
  const awaitingClient = queue.filter((e) => e.status === "AWAITING_CLIENT");
  const highValue = all.filter((e) => e.severity === "HIGH");
  const exceptionValue = all.reduce((sum, e) => sum + (e.difference ?? 0), 0);

  return (
    <div>
      <PageHeader
        title="Partner review"
        description={`${queue.length} items require review`}
      />

      <div className="grid grid-cols-4 gap-3">
        <div className="panel px-5 py-4">
          <p className="num text-2xl font-medium text-accent">{formatCompactINR(exceptionValue)}</p>
          <p className="mt-1 text-sm text-ink-soft">Exception value</p>
        </div>
        <div className="panel px-5 py-4">
          <p className="num text-2xl font-medium text-ink">{highValue.length}</p>
          <p className="mt-1 text-sm text-ink-soft">High-value exceptions</p>
        </div>
        <div className="panel px-5 py-4">
          <p className="num text-2xl font-medium text-ink">{awaitingClient.length}</p>
          <p className="mt-1 text-sm text-ink-soft">Awaiting client</p>
        </div>
        <div className="panel px-5 py-4">
          <p className="num text-2xl font-medium text-ink">{forReview.length}</p>
          <p className="mt-1 text-sm text-ink-soft">Ready for approval</p>
        </div>
      </div>

      <div className="mt-8">
        {queue.length === 0 ? (
          <EmptyState
            title="Nothing needs your review"
            description="Exceptions sent for review or awaiting client input will appear here."
          />
        ) : (
          <ExceptionTable exceptions={queue} showClient />
        )}
      </div>
    </div>
  );
}
