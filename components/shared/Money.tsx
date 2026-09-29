import { formatINR } from "@/lib/format";

export function Money({ value, className = "" }: { value: number | null; className?: string }) {
  return <span className={`num ${className}`}>{formatINR(value)}</span>;
}
