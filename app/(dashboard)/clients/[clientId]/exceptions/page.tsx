import { notFound } from "next/navigation";
import { ExceptionTable } from "@/components/exceptions/ExceptionTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { getClientDbId } from "@/lib/supabase/queries/clients";
import { getExceptions } from "@/lib/supabase/queries/exceptions";

export default async function ExceptionsPage({
  params,
}: {
  params: { clientId: string };
}) {
  const dbId = await getClientDbId(params.clientId);
  if (!dbId) notFound();

  const exceptions = await getExceptions(dbId);

  if (exceptions.length === 0) {
    return (
      <EmptyState
        title="No unresolved exceptions"
        description="All current reconciliation items have been reviewed."
      />
    );
  }

  return <ExceptionTable exceptions={exceptions} />;
}
