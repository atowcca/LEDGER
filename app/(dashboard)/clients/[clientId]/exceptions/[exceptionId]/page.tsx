import { notFound } from "next/navigation";
import { ExceptionWorkspace } from "@/components/exceptions/ExceptionWorkspace";
import { getException } from "@/lib/supabase/queries/exceptions";
import { listUsers, getCurrentUser } from "@/lib/supabase/queries/users";

export default async function ExceptionDetailPage({
  params,
}: {
  params: { clientId: string; exceptionId: string };
}) {
  const [exception, assignableUsers, currentUser] = await Promise.all([
    getException(params.exceptionId),
    listUsers(),
    getCurrentUser(),
  ]);
  if (!exception || exception.clientId !== params.clientId) notFound();

  return (
    <ExceptionWorkspace
      exception={exception}
      assignableUsers={assignableUsers}
      currentUserRole={currentUser?.role ?? null}
    />
  );
}
