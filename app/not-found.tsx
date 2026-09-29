import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-2 bg-paper text-center">
      <p className="font-serif text-2xl font-semibold text-ink">Not found</p>
      <p className="text-sm text-ink-soft">
        That client, exception, or page doesn&apos;t exist in this demo.
      </p>
      <Link href="/" className="btn-secondary mt-3">
        Back to dashboard
      </Link>
    </div>
  );
}
