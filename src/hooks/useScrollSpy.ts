import { useEffect, useState } from "react";

/**
 * Tracks which section is currently in view (rAF-throttled scroll handler,
 * same approach as the design prototype). Returns the active section id.
 */
export function useScrollSpy(ids: string[], topOffset = 130): string {
  const [active, setActive] = useState<string>(ids[0] ?? "");

  useEffect(() => {
    let raf: number | null = null;

    const update = () => {
      raf = null;
      // Winner = the section whose top is deepest while still above the
      // offset. Order-independent, so config-reordered sections spy correctly.
      let current = ids[0] ?? "";
      let bestTop = -Infinity;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top <= topOffset && top > bestTop) {
          bestTop = top;
          current = id;
        }
      }
      setActive((prev) => (prev === current ? prev : current));
    };

    const onScroll = () => {
      if (raf !== null) return;
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf !== null) cancelAnimationFrame(raf);
    };
  }, [ids, topOffset]);

  return active;
}
