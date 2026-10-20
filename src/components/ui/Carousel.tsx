import { useEffect, useRef, useState } from "react";
import { ImageFrame } from "@/components/ui/ImageFrame";
import { cn } from "@/lib/utils";

export interface CarouselSlide {
  src: string;
  alt: string;
  /** No file yet: the slide shows a drawn placeholder instead. */
  missing: boolean;
}

export interface CarouselProps {
  slides: CarouselSlide[];
  /** CSS aspect-ratio shared by every slide. */
  aspect: string;
  /** Accessible name for the whole carousel, e.g. "Usapp screens". */
  label: string;
  /** Opens slide `i` full size. Placeholder slides are not clickable. */
  onOpen?: (i: number) => void;
  reducedMotion: boolean;
  /** Time each slide stays up while rotating. */
  intervalMs?: number;
}

/**
 * Auto-rotating image carousel. It pauses while hovered, focused, off screen
 * or in a background tab, never rotates for reduced motion, and can be driven
 * by the arrows, the dots, the keyboard or a swipe.
 */
export function Carousel({
  slides,
  aspect,
  label,
  onOpen,
  reducedMotion,
  intervalMs = 4500,
}: CarouselProps) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const swipeFrom = useRef<number | null>(null);
  const total = slides.length;
  const go = (i: number) => setIndex(((i % total) + total) % total);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) =>
      setVisible(entry?.isIntersecting ?? false),
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (reducedMotion || paused || !visible || total < 2) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        setIndex((i) => (i + 1) % total);
      }
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [reducedMotion, paused, visible, total, intervalMs]);

  const portrait =
    aspect
      .split("/")
      .map(Number)
      .reduce((w, h) => w / h) < 0.9;

  return (
    <div
      ref={rootRef}
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") go(index + 1);
        if (event.key === "ArrowLeft") go(index - 1);
      }}
      onPointerDown={(event) => {
        swipeFrom.current = event.clientX;
      }}
      onPointerUp={(event) => {
        const from = swipeFrom.current;
        swipeFrom.current = null;
        if (from === null || Math.abs(event.clientX - from) < 40) return;
        go(index + (event.clientX < from ? 1 : -1));
      }}
      className={cn(
        "relative select-none",
        portrait && "mx-auto max-w-[320px]",
      )}
    >
      <div
        className="relative overflow-hidden rounded-xl border border-border bg-surface shadow-window"
        style={{ aspectRatio: aspect }}
      >
        {slides.map((slide, i) => {
          const active = i === index;
          const frame = (
            <ImageFrame
              src={slide.src}
              alt={slide.alt}
              aspect={aspect}
              missing={slide.missing}
              fit={portrait ? "contain" : "cover"}
              eager={i === 0}
              fallbackLabel={slide.alt}
              slot={{ index: i + 1, total }}
              className="h-full"
            />
          );
          return (
            <div
              key={slide.src}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${total}`}
              aria-hidden={!active}
              className={cn(
                "absolute inset-0 transition-[opacity,transform] duration-reveal ease-standard",
                active ? "z-1 scale-100 opacity-100" : "scale-[1.02] opacity-0",
              )}
            >
              {onOpen && !slide.missing ? (
                <button
                  type="button"
                  tabIndex={active ? 0 : -1}
                  onClick={() => onOpen(i)}
                  aria-label={`Open ${slide.alt} full size`}
                  className="block h-full w-full cursor-zoom-in border-none bg-transparent p-0 focus-visible:outline-solid focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
                >
                  {frame}
                </button>
              ) : (
                frame
              )}
            </div>
          );
        })}
      </div>

      {total > 1 && (
        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex">
            {slides.map((slide, i) => (
              <button
                key={slide.src}
                type="button"
                onClick={() => go(i)}
                aria-label={`Show slide ${i + 1} of ${total}`}
                aria-current={i === index ? "true" : undefined}
                className="flex h-6 cursor-pointer items-center border-none bg-transparent px-0.5 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-accent"
              >
                <span
                  className={cn(
                    "block h-2 rounded-full transition-colors duration-base ease-standard",
                    i === index ? "w-6 bg-accent" : "w-2 bg-border-strong",
                  )}
                />
              </button>
            ))}
          </div>
          <div className="flex gap-1.5">
            {[-1, 1].map((step) => (
              <button
                key={step}
                type="button"
                onClick={() => go(index + step)}
                aria-label={step < 0 ? "Previous slide" : "Next slide"}
                className="grid h-9 w-9 cursor-pointer place-items-center rounded-full border border-control-border bg-surface font-mono text-sm text-heading transition-colors duration-fast hover:bg-hover-tint focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <span aria-hidden="true">{step < 0 ? "←" : "→"}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
