import { useTypewriter } from "@/hooks/useTypewriter";

export interface TypedTextProps {
  text: string;
  charMs: number;
  startDelayMs?: number;
  /** Render the full text immediately (reduced motion). */
  instant?: boolean;
  className?: string;
}

/**
 * Typed-out text. The full text ships in a
 * visually-hidden span (screen readers get the complete sentence once);
 * the animated copy is aria-hidden so AT never hears partial fragments.
 */
export function TypedText({
  text,
  charMs,
  startDelayMs = 0,
  instant = false,
  className,
}: TypedTextProps) {
  const { displayed } = useTypewriter(text, { charMs, startDelayMs, instant });
  return (
    <p className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">{displayed}</span>
    </p>
  );
}
