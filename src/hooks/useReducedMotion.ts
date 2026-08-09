import { useEffect, useState } from "react";

/**
 * Tracks the user's prefers-reduced-motion setting. SSR renders `false`;
 * the real value lands right after mount (CSS media queries in globals.css
 * kill keyframe animations immediately, so there is no motion flash).
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
