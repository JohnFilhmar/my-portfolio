import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";

/**
 * Reveal-on-scroll (fade + rise) as progressive enhancement: SSR and no-JS
 * render fully visible; when JS runs, below-the-fold sections start hidden
 * and reveal on intersection. Disabled entirely for reduced motion.
 */
export function useReveal<T extends HTMLElement>(
  disabled: boolean,
): { ref: RefObject<T>; style: CSSProperties } {
  const ref = useRef<T>(null);
  const [revealed, setRevealed] = useState(true);

  useEffect(() => {
    if (disabled) {
      setRevealed(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    // Only animate elements that start below the fold.
    if (el.getBoundingClientRect().top <= window.innerHeight * 0.92) return;

    setRevealed(false);
    // Fires once the top edge is 8% into the viewport. A ratio threshold
    // would never fire for a section taller than the viewport divided by it.
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setRevealed(true);
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [disabled]);

  const style: CSSProperties = revealed
    ? {
        opacity: 1,
        transform: "none",
        transition:
          "opacity var(--duration-reveal) var(--easing-reveal), transform var(--duration-reveal) var(--easing-reveal)",
      }
    : { opacity: 0, transform: "translateY(20px)" };

  return { ref, style };
}
