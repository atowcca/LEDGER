import { SidebarNav } from "@/components/layout/SidebarNav";
import { getCurrentUser } from "@/lib/supabase/queries/users";

export async function Sidebar() {
  const user = await getCurrentUser();

  // Partner Review is where the firm's partners approve or return exceptions
  // (spec section 8.1/33) — hidden from Senior/Staff, who work exceptions but
  // don't have final sign-off. Everyone still sees their own client work.
  const items = [
    { label: "Dashboard", href: "/" },
    { label: "Clients", href: "/clients" },
    ...(user?.role === "PARTNER"
      ? [
          { label: "Review", href: "/review" },
          { label: "Team", href: "/team" },
        ]
      : []),
  ];

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-surface">
      <div className="flex h-14 items-center border-b border-border px-4">
        <span className="font-serif text-lg font-semibold text-ink">CA Ledger</span>
      </div>
      <SidebarNav items={items} />
      <div className="border-t border-border px-4 py-3">
        <p className="text-xs text-ink-faint">Demo build · synthetic data</p>
      </div>
    </aside>
  );
}
