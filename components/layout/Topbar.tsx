import { getCurrentUser } from "@/lib/supabase/queries/users";
import { GlobalSearch } from "@/components/layout/GlobalSearch";
import { UserMenu } from "@/components/layout/UserMenu";

export async function Topbar() {
  const user = await getCurrentUser();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-surface px-6">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-ink">Northgate & Associates</span>
        <span className="text-ink-faint">·</span>
        <GlobalSearch />
      </div>
      <div className="flex items-center gap-3">
        <button className="btn-ghost" aria-label="Notifications">
          Notifications
        </button>
        {user && <UserMenu initials={user.initials} name={user.name} />}
      </div>
    </header>
  );
}
