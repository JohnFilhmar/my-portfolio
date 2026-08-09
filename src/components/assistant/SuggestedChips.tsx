export interface SuggestedChipsProps {
  questions: string[];
  onAsk: (question: string) => void;
}

/** Tap-to-ask suggested questions (great on mobile). */
export function SuggestedChips({ questions, onAsk }: SuggestedChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {questions.map((question) => (
        <button
          key={question}
          type="button"
          onClick={() => onAsk(question)}
          className="cursor-pointer rounded-pill border border-border-chip bg-surface px-3.5 py-2 text-left font-mono text-sm text-foreground transition-colors duration-fast hover:border-accent hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {question}
        </button>
      ))}
    </div>
  );
}
