import { useCallback, useEffect, useRef, useState } from "react";
import type { BootLine } from "@config/schema";

export interface BootSequenceOptions {
  charMs: number;
  linePauseMs: number;
  startDelayMs: number;
  /** Render everything immediately (reduced motion / boot disabled). */
  instant?: boolean;
  /** Characters revealed per tick — matches the reference prototype's pacing. */
  charsPerTick?: number;
}

export interface BootSequenceState {
  lines: BootLine[];
  booting: boolean;
  skip: () => void;
  replay: () => void;
}

/** Terminal boot-sequence animation: types each line, then moves to the next. */
export function useBootSequence(
  allLines: BootLine[],
  {
    charMs,
    linePauseMs,
    startDelayMs,
    instant = false,
    charsPerTick = 3,
  }: BootSequenceOptions,
): BootSequenceState {
  const [lines, setLines] = useState<BootLine[]>(instant ? allLines : []);
  const [booting, setBooting] = useState(!instant);
  const timerRef = useRef<number | null>(null);
  const cancelledRef = useRef(false);
  // Replay counter lets the palette's "replay boot" restart the effect.
  const [run, setRun] = useState(0);

  const clearTimer = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const skip = useCallback(() => {
    cancelledRef.current = true;
    clearTimer();
    setLines(allLines);
    setBooting(false);
  }, [allLines]);

  const replay = useCallback(() => {
    setRun((n) => n + 1);
  }, []);

  useEffect(() => {
    if (instant) {
      setLines(allLines);
      setBooting(false);
      return;
    }
    cancelledRef.current = false;
    setLines([]);
    setBooting(true);

    let lineIndex = 0;
    let charIndex = 0;
    const partial: BootLine[] = [];

    const tick = () => {
      if (cancelledRef.current) return;
      const current = allLines[lineIndex];
      if (!current) {
        setBooting(false);
        return;
      }
      charIndex = Math.min(charIndex + charsPerTick, current.text.length);
      partial[lineIndex] = {
        ...current,
        text: current.text.slice(0, charIndex),
      };
      setLines([...partial]);
      if (charIndex >= current.text.length) {
        lineIndex += 1;
        charIndex = 0;
        timerRef.current = window.setTimeout(tick, linePauseMs);
      } else {
        timerRef.current = window.setTimeout(tick, charMs);
      }
    };

    timerRef.current = window.setTimeout(tick, startDelayMs);
    return () => {
      cancelledRef.current = true;
      clearTimer();
    };
  }, [allLines, charMs, linePauseMs, startDelayMs, instant, charsPerTick, run]);

  return { lines, booting, skip, replay };
}
