import { useEffect, useRef, useState } from "react";
import type { PortraitShot } from "@config/schema";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { GlyphAnimator, type MorphPlan } from "@/lib/glyphPortrait/animator";
import {
  glyphGridSchema,
  gridLevels,
  type GlyphGrid,
} from "@/lib/glyphPortrait/grid";
import { cn } from "@/lib/utils";

/** How a change plays: the first slow build, a click's pulse, or a hover swap. */
export type GlyphMode = "build" | "pulse" | "swap";

/** One requested change of portrait. A new object starts a new morph. */
export interface GlyphChange {
  shot: PortraitShot;
  /** Where the change spreads from, as fractions of the frame (0-1). */
  origin: { x: number; y: number };
  mode: GlyphMode;
}

export interface GlyphPortraitProps {
  change: GlyphChange;
  /** Photos to fetch in the background once the first one shows. */
  preload: readonly PortraitShot[];
  className?: string;
}

/** The dimmed photo under the glyphs; the newest fades in over the last. */
interface Underlay {
  image: string;
  key: number;
  first: boolean;
}

const MORPH_FRAME_MS = 33;
const SHIMMER_FRAME_MS = 90;
const PRELOAD_DELAY_MS = 2500;
const PHOTO = "bg-contain bg-bottom bg-no-repeat";

const grids = new Map<string, Promise<GlyphGrid>>();

/** Fetches and validates a grid once per URL; a failed fetch can be retried. */
function loadGrid(src: string): Promise<GlyphGrid> {
  const cached = grids.get(src);
  if (cached) return cached;
  const request = fetch(src)
    .then((res) => {
      if (!res.ok) throw new Error(`${src}: HTTP ${res.status}`);
      return res.json();
    })
    .then((data: unknown) => glyphGridSchema.parse(data));
  request.catch(() => grids.delete(src));
  grids.set(src, request);
  return request;
}

/** Timing for each mode: build is slow and scattered, pulse is a ring, swap is quick. */
function planFor(
  change: GlyphChange,
  grid: GlyphGrid,
  reduced: boolean,
): MorphPlan {
  if (reduced) return { delay: () => 0, scramble: 0, pulse: false };
  const ox = change.origin.x * grid.cols;
  const oy = change.origin.y * grid.rows;
  const reach = Math.hypot(grid.cols, grid.rows);
  const dist = (col: number, row: number) =>
    Math.hypot(col - ox, row - oy) / reach;
  switch (change.mode) {
    case "build":
      return {
        delay: (c, r) => dist(c, r) * 1800 + Math.random() * 1600,
        scramble: 700,
        pulse: false,
      };
    case "pulse":
      return { delay: (c, r) => dist(c, r) * 1100, scramble: 320, pulse: true };
    case "swap":
      return {
        delay: (c, r) => dist(c, r) * 450 + Math.random() * 120,
        scramble: 200,
        pulse: false,
      };
  }
}

/** Gives the <pre> one text node per row and returns an animator writing into them. */
function mountGrid(
  pre: HTMLPreElement,
  grid: GlyphGrid,
  reduced: boolean,
): GlyphAnimator {
  const rows = Array.from({ length: grid.rows }, () =>
    document.createTextNode(""),
  );
  pre.replaceChildren(
    ...rows.flatMap((node, i) =>
      i === 0 ? [node] : [document.createTextNode("\n"), node],
    ),
  );
  return new GlyphAnimator({
    cols: grid.cols,
    rows: grid.rows,
    shimmer: reduced ? 0 : undefined,
    writeRow: (row, text) => {
      const node = rows[row];
      if (node) node.data = text;
    },
  });
}

/**
 * A portrait drawn as live ASCII text over a dimmed copy of the photo. The
 * glyphs take their color from the photo (`background-clip: text`), so they
 * work on either theme. It builds up slowly on first load, then morphs to each
 * new `change`, spreading from its origin, and keeps a faint shimmer while
 * idle. With reduced motion, changes are instant and still.
 */
export function GlyphPortrait({
  change,
  preload,
  className,
}: GlyphPortraitProps) {
  const preRef = useRef<HTMLPreElement>(null);
  const animatorRef = useRef<GlyphAnimator | null>(null);
  const wakeRef = useRef<() => void>(() => {});
  const reducedRef = useRef(false);
  const underlayKey = useRef(0);
  const [size, setSize] = useState<{ cols: number; rows: number } | null>(null);
  const [underlays, setUnderlays] = useState<Underlay[]>([]);
  const reduced = useReducedMotion();

  useEffect(() => {
    const pre = preRef.current;
    if (!pre) return;
    let frame = 0;
    let last = 0;
    let visible = true;
    const step = (now: number) => {
      frame = 0;
      const animator = animatorRef.current;
      if (!animator || !visible) return;
      const keepGoing = animator.isMorphing() || !reducedRef.current;
      const due =
        now - last >=
        (animator.isMorphing() ? MORPH_FRAME_MS : SHIMMER_FRAME_MS);
      if (due || !keepGoing) {
        animator.tick(now);
        last = now;
      }
      if (animator.isMorphing() || !reducedRef.current) {
        frame = requestAnimationFrame(step);
      }
    };
    const wake = () => {
      if (!frame) frame = requestAnimationFrame(step);
    };
    wakeRef.current = wake;
    const io = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
      if (visible) wake();
    });
    io.observe(pre);
    return () => {
      cancelAnimationFrame(frame);
      io.disconnect();
      wakeRef.current = () => {};
    };
  }, []);

  useEffect(() => {
    reducedRef.current = reduced;
    wakeRef.current();
  }, [reduced]);

  useEffect(() => {
    let cancelled = false;
    loadGrid(change.shot.glyphs)
      .then((grid) => {
        const pre = preRef.current;
        if (cancelled || !pre) return;
        let animator = animatorRef.current;
        if (
          !animator ||
          animator.cols !== grid.cols ||
          animator.rows !== grid.rows
        ) {
          animator = mountGrid(pre, grid, reducedRef.current);
          animatorRef.current = animator;
          setSize({ cols: grid.cols, rows: grid.rows });
        }
        pre.style.backgroundImage = `url("${change.shot.image}")`;
        const key = ++underlayKey.current;
        setUnderlays((prev) => [
          ...prev.slice(-1),
          { image: change.shot.image, key, first: key === 1 },
        ]);
        animator.morphTo(
          gridLevels(grid),
          performance.now(),
          planFor(change, grid, reducedRef.current),
        );
        wakeRef.current();
      })
      .catch(() => {
        // A missing grid leaves the frame as it is; the next change retries.
      });
    return () => {
      cancelled = true;
    };
  }, [change]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      for (const shot of preload) {
        loadGrid(shot.glyphs).catch(() => {});
        new Image().src = shot.image;
      }
    }, PRELOAD_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [preload]);

  return (
    <div
      aria-hidden="true"
      className={cn(
        "absolute inset-0 flex items-end justify-center [container-type:size]",
        className,
      )}
    >
      <div
        className="relative"
        style={
          size
            ? {
                fontSize: `min(calc(100cqw / ${size.cols}), calc(100cqh / ${size.rows}))`,
              }
            : undefined
        }
      >
        {underlays.map((u, i) => (
          <div
            key={u.key}
            style={{ backgroundImage: `url("${u.image}")` }}
            className={cn(
              "absolute inset-0",
              PHOTO,
              i < underlays.length - 1
                ? "opacity-0 transition-opacity duration-reveal ease-standard"
                : cn(
                    "opacity-15",
                    u.first ? "animate-photo-in" : "animate-photo-swap",
                  ),
            )}
          />
        ))}
        <pre
          ref={preRef}
          className={cn(
            "relative m-0 select-none whitespace-pre bg-clip-text font-mono font-semibold leading-none tracking-cell text-transparent",
            // Lifts the glyphs off the dimmed photo: darker on light, brighter on dark.
            "brightness-75 contrast-125 saturate-150 dark:brightness-125",
            PHOTO,
          )}
        />
      </div>
    </div>
  );
}
