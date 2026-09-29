import Link from "next/link";
import { formatCompactINR } from "@/lib/format";
import type { Client } from "@/lib/types";

export function PriorityExceptionCard({
  client,
  headline,
  value,
}: {
  client: Client;
  headline: string;
  value: number;
}) {
  return (
    <Link
      href={`/clients/${client.id}`}
      className="panel flex items-center justify-between px-5 py-4 hover:border-border-strong"
    >
      <div>
        <p className="text-sm font-medium text-ink">{client.name}</p>
        <p className="mt-0.5 text-sm text-ink-soft">{headline}</p>
      </div>
      <p className="num text-lg font-medium text-accent">{formatCompactINR(value)}</p>
    </Link>
  );
}
