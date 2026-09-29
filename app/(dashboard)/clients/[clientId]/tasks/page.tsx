import { notFound } from "next/navigation";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatDate } from "@/lib/format";
import { getClientDbId } from "@/lib/supabase/queries/clients";
import { getTasks } from "@/lib/supabase/queries/tasks";

export default async function TasksPage({
  params,
}: {
  params: { clientId: string };
}) {
  const dbId = await getClientDbId(params.clientId);
  if (!dbId) notFound();

  const tasks = await getTasks(dbId);

  if (tasks.length === 0) {
    return (
      <EmptyState
        title="No open tasks"
        description="Tasks are created automatically when an exception is assigned to staff."
      />
    );
  }

  return (
    <table className="w-full panel border-collapse">
      <thead>
        <tr>
          <th className="th-cell">Task</th>
          <th className="th-cell">Assigned to</th>
          <th className="th-cell">Status</th>
          <th className="th-cell">Since</th>
        </tr>
      </thead>
      <tbody>
        {tasks.map((t) => (
          <tr key={t.id} className="hover:bg-paper">
            <td className="td-cell font-medium capitalize text-ink">{t.title}</td>
            <td className="td-cell text-ink-soft">{t.assignedTo.name}</td>
            <td className="td-cell">
              <StatusBadge status={t.status} />
            </td>
            <td className="td-cell text-ink-soft">{formatDate(t.dueDate)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
