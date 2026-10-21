import { useMemo, useState, type MouseEvent, type PointerEvent } from "react";
import type { HeroConfig } from "@config/schema";
import {
  GlyphPortrait,
  type GlyphChange,
  type GlyphMode,
} from "@/components/sections/GlyphPortrait";
import { PlaceholderArt } from "@/components/ui/PlaceholderArt";
import { cn } from "@/lib/utils";

export interface HeroPortraitProps {
  portrait: HeroConfig["portrait"];
  className?: string;
}

const LAYER = {
  active:
    "z-2 opacity-100 [clip-path:inset(0)] transition-[clip-path] duration-reveal ease-standard",
  leaving: "z-1 opacity-0 transition-opacity duration-reveal ease-standard",
  idle: "opacity-0 [clip-path:inset(100%_0_0_0)]",
} as const;

/** Roughly where a face sits in the frame: the first build spreads from here. */
const FACE = { x: 0.5, y: 0.4 };

/** The pointer's position as fractions of the element it is over. */
function pointIn(event: MouseEvent<Element>): { x: number; y: number } {
  if (event.detail === 0 && event.type === "click") return FACE;
  const box = event.currentTarget.getBoundingClientRect();
  return {
    x: (event.clientX - box.left) / box.width,
    y: (event.clientY - box.top) / box.height,
  };
}

/**
 * The hero portrait: ASCII glyphs build up slowly on load, then resolve into
 * the photo. Hovering turns the photo back into glyphs that morph into its
 * hover partner (`NN-hover`) and resolve into that photo; clicking sends a
 * pulse through the glyphs into the next pair. Touch skips hover and taps
 * cycle. Until grids exist, the same spot cycles through drawn placeholders,
 * so the layout can be judged.
 */
export function HeroPortrait({ portrait, className }: HeroPortraitProps) {
  const { frames, alt, cycleLabel, emptyLabel, placeholderCount } = portrait;
  const glyphs = frames.length > 0;
  const total = glyphs ? frames.length : placeholderCount;
  const cycles = total > 1;
  const [index, setIndex] = useState(0);
  const [previous, setPrevious] = useState<number | null>(null);
  const [hovered, setHovered] = useState(false);
  const [change, setChange] = useState<GlyphChange | null>(() =>
    frames[0] ? { shot: frames[0].main, origin: FACE, mode: "build" } : null,
  );
  const preload = useMemo(
    () => frames.flatMap((f) => (f.hover ? [f.main, f.hover] : [f.main])),
    [frames],
  );

  // Asks the glyphs for photo `i` (or its hover partner), unless already showing it.
  const show = (
    i: number,
    hover: boolean,
    origin: GlyphChange["origin"],
    mode: GlyphMode,
  ) => {
    const frame = frames[i];
    if (!frame) return;
    const shot = hover && frame.hover ? frame.hover : frame.main;
    if (shot !== change?.shot) setChange({ shot, origin, mode });
  };

  const hover = (event: PointerEvent<HTMLElement>, on: boolean) => {
    if (event.pointerType === "touch") return;
    setHovered(on);
    show(index, on, pointIn(event), "swap");
  };

  return (
    <figure
      onPointerEnter={(e) => hover(e, true)}
      onPointerLeave={(e) => hover(e, false)}
      className={cn(
        "group relative m-0 aspect-5/4 w-full md:aspect-square max-w-[calc(100dvh-var(--space-header-height)-var(--space-hero-top))] animate-rise-in",
        className,
      )}
    >
      <div
        role="img"
        aria-label={alt}
        className="absolute inset-0 transition-transform duration-base ease-standard group-hover:-translate-y-2"
      >
        {glyphs && change ? (
          <GlyphPortrait change={change} preload={preload} />
        ) : (
          Array.from({ length: placeholderCount }, (_, i) => {
            const state =
              i === index ? "active" : i === previous ? "leaving" : "idle";
            return (
              <span
                key={i}
                aria-hidden="true"
                className={cn("absolute inset-0", LAYER[state])}
              >
                <PlaceholderArt
                  kind="person"
                  label={emptyLabel}
                  path={`assets/portrait/${String(i + 1).padStart(2, "0")}.png`}
                  plain
                  className="text-heading"
                />
              </span>
            );
          })
        )}
      </div>
      {cycles && (
        <>
          <button
            type="button"
            aria-label={`${cycleLabel} (${index + 1} of ${total})`}
            onClick={(e) => {
              const next = (index + 1) % total;
              setPrevious(index);
              setIndex(next);
              show(next, hovered, pointIn(e), "pulse");
            }}
            className="absolute inset-0 z-3 cursor-pointer border-none bg-transparent focus-visible:outline-solid focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
          />
          <figcaption
            aria-hidden="true"
            className="pointer-events-none absolute bottom-4 left-[calc(6%+1rem)] z-4 rounded-sm bg-surface px-2 py-1 font-mono text-2xs text-heading"
          >
            {String(index + 1).padStart(2, "0")} /{" "}
            {String(total).padStart(2, "0")}
          </figcaption>
        </>
      )}
    </figure>
  );
}
