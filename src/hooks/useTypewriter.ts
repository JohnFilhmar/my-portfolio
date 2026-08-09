import { useEffect, useRef, useState } from "react";

export interface TypewriterOptions {
  /** Milliseconds per character. */
  charMs: number;
  /** Delay before typing starts. */
  startDelayMs?: number;
  /** When true (reduced motion), the full text renders immediately. */
  instant?: boolean;
}

/** Types `text` out character by character. Static fallback when `instant`. */
export function useTypewriter(
  text: string,
  { charMs, startDelayMs = 0, instant = false }: TypewriterOptions,
): { displayed: string; done: boolean } {
  const [displayed, setDisplayed] = useState(instant ? text : "");
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (instant) {
      setDisplayed(text);
      return;
    }
    setDisplayed("");
    let index = 0;
    const tick = () => {
      index = Math.min(index + 1, text.length);
      setDisplayed(text.slice(0, index));
      if (index < text.length) {
        timerRef.current = window.setTimeout(tick, charMs);
      }
    };
    timerRef.current = window.setTimeout(tick, startDelayMs);
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, [text, charMs, startDelayMs, instant]);

  return { displayed, done: displayed.length === text.length };
}
