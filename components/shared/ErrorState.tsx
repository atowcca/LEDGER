export function ErrorState({
  title,
  description,
  onRetry,
}: {
  title: string;
  description: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-start gap-2 rounded border border-status-mismatch/30 bg-status-mismatch-bg px-4 py-3">
      <p className="text-sm font-medium text-status-mismatch">{title}</p>
      <p className="text-sm text-ink-soft">{description}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary mt-1">
          Retry
        </button>
      )}
    </div>
  );
}
