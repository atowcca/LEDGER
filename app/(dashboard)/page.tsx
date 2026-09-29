import { PageHeader } from "@/components/shared/PageHeader";
import { OverviewStrip } from "@/components/dashboard/OverviewStrip";
import { PriorityExceptionCard } from "@/components/dashboard/PriorityExceptionCard";
import { getCurrentUser } from "@/lib/supabase/queries/users";
import { getDashboardStats, getPriorityExceptionGroups } from "@/lib/supabase/queries/dashboard";

export default async function DashboardPage() {
  const [user, stats, priorityGroups] = await Promise.all([
    getCurrentUser(),
    getDashboardStats(),
    getPriorityExceptionGroups(),
  ]);

  return (
    <div>
      <PageHeader
        eyebrow="Compliance overview"
        title={`Good morning${user ? `, ${user.name.split(" ")[0]}` : ""}`}
      />

      <OverviewStrip
        totalClients={stats.totalClients}
        openExceptions={stats.openExceptions}
        awaitingClient={stats.awaitingClient}
        partnerReviews={stats.partnerReviews}
      />

      <div className="mt-8">
        <h2 className="text-sm font-medium text-ink">Priority exceptions</h2>
        <p className="mt-0.5 text-sm text-ink-soft">Where to look first, ranked by exception value.</p>
        <div className="mt-3 flex flex-col gap-2">
          {priorityGroups.length === 0 ? (
            <p className="text-sm text-ink-soft">Nothing needs attention right now.</p>
          ) : (
            priorityGroups.map((g) => (
              <PriorityExceptionCard
                key={g.client.id}
                client={g.client}
                headline={g.headline}
                value={g.value}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
