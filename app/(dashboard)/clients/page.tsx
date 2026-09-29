import { PageHeader } from "@/components/shared/PageHeader";
import { ClientsBrowser } from "@/components/clients/ClientsBrowser";
import { listClients } from "@/lib/supabase/queries/clients";

export default async function ClientsPage() {
  const clients = await listClients();

  return (
    <div>
      <PageHeader
        title="Clients"
        description={`${clients.length} clients under active engagement`}
      />
      <ClientsBrowser clients={clients} />
    </div>
  );
}
