export function WhyPanel({
  whyExplanation,
  aiSuggestedSteps,
}: {
  whyExplanation: string[];
  aiSuggestedSteps: string[];
}) {
  return (
    <div className="panel p-4">
      <p className="text-sm font-medium text-ink">Why this happened</p>
      <ul className="mt-2 flex flex-col gap-1">
        {whyExplanation.map((line, i) => (
          <li key={i} className="text-sm text-ink-soft">
            {line}
          </li>
        ))}
      </ul>

      <div className="mt-4 rounded-sm border border-status-review/30 bg-status-review-bg px-3 py-3">
        <p className="text-xs font-medium text-status-review">Assistant explanation — not an accounting conclusion</p>
        <p className="mt-1 text-sm text-ink-soft">Suggested verification steps:</p>
        <ol className="mt-1 flex flex-col gap-1">
          {aiSuggestedSteps.map((step, i) => (
            <li key={i} className="text-sm text-ink">
              {i + 1}. {step}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
