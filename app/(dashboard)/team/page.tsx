import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { InviteTeammate } from "@/components/team/InviteTeammate";
import { getCurrentUser, listUsers } from "@/lib/supabase/queries/users";

export default async function TeamPage() {
  const currentUser = await getCurrentUser();
  if (currentUser?.role !== "PARTNER") {
    redirect("/");
  }

  const users = await listUsers();

  return (
    <div>
      <PageHeader title="Team" description={`${users.length} people at Northgate & Associates`} />

      <div className="flex flex-col gap-6">
        <InviteTeammate />

        <table className="w-full panel border-collapse">
          <thead>
            <tr>
              <th className="th-cell">Name</th>
              <th className="th-cell">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-paper">
                <td className="td-cell font-medium text-ink">{u.name}</td>
                <td className="td-cell text-ink-soft">{u.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
