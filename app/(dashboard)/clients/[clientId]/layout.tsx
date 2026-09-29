import Link from "next/link";
import { notFound } from "next/navigation";
import { ClientTabs } from "@/components/layout/ClientTabs";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { getClient } from "@/lib/supabase/queries/clients";

export default async function ClientWorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { clientId: string };
}) {
  const client = await getClient(params.clientId);
  if (!client) notFound();

  return (
    <div className="-mx-8 -my-6">
      <div className="border-b border-border bg-surface px-8 py-4">
        <Link href="/clients" className="text-sm text-ink-soft hover:text-accent">
          ← Clients
        </Link>
        <div className="mt-2 flex items-center gap-3">
          <h1 className="font-serif text-xl font-semibold text-ink">{client.name}</h1>
          <StatusBadge status={client.status} />
        </div>
        <p className="mt-1 num text-sm text-ink-soft">GSTIN: {client.gstin}</p>
      </div>
      <div className="bg-surface px-2">
        <ClientTabs clientId={client.id} />
      </div>
      <div className="px-8 py-6">{children}</div>
    </div>
  );
}
