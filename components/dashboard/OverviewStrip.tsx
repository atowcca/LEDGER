function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="panel px-5 py-4">
      <p className="font-mono text-2xl font-medium tabular-nums text-ink">{value}</p>
      <p className="mt-1 text-sm text-ink-soft">{label}</p>
    </div>
  );
}

export function OverviewStrip({
  totalClients,
  openExceptions,
  awaitingClient,
  partnerReviews,
}: {
  totalClients: number;
  openExceptions: number;
  awaitingClient: number;
  partnerReviews: number;
}) {
  return (
    <div className="grid grid-cols-4 gap-3">
      <Stat value={totalClients} label="Clients" />
      <Stat value={openExceptions} label="Open exceptions" />
      <Stat value={awaitingClient} label="Awaiting client" />
      <Stat value={partnerReviews} label="Partner reviews" />
    </div>
  );
}
