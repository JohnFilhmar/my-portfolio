import { useEffect, useRef, useState, type CSSProperties } from "react";
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

const MORPH_FRAME_MS = 33;
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

/** Timing for each mode: build is slow and scattered, pulse is a ring, swap is a quick wave. */
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
        delay: (c, r) => dist(c, r) * 700 + Math.random() * 200,
        scramble: 300,
        pulse: false,
      };
  }
}

/** Gives the <pre> one text node per row and returns an animator writing into them. */
function mountGrid(pre: HTMLPreElement, grid: GlyphGrid): GlyphAnimator {
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
    shimmer: 0,
    writeRow: (row, text) => {
      const node = rows[row];
      if (node) node.data = text;
    },
  });
}

/**
 * A portrait that arrives as ASCII and resolves into the real photo. Each
 * `change` dissolves the photo into glyphs (colored by the photo through
 * `background-clip: text`) in a feathered wave from its origin, morphs them
 * into the new picture, then reveals the new photo in a wave from the same
 * origin (the masks live in globals.css under `.glyph-stage`). With reduced
 * motion the photo swaps directly.
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
  /** The photo to reveal once the current morph settles. */
  const pendingRef = useRef<string | null>(null);
  const [size, setSize] = useState<{ cols: number; rows: number } | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [resolved, setResolved] = useState(false);
  const [origin, setOrigin] = useState(change.origin);
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
      if (now - last >= MORPH_FRAME_MS || reducedRef.current) {
        animator.tick(now);
        last = now;
      }
      if (animator.isMorphing()) {
        frame = requestAnimationFrame(step);
      } else if (pendingRef.current) {
        setPhoto(pendingRef.current);
        setResolved(true);
        pendingRef.current = null;
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
          animator = mountGrid(pre, grid);
          animatorRef.current = animator;
          setSize({ cols: grid.cols, rows: grid.rows });
        }
        pre.style.backgroundImage = `url("${change.shot.image}")`;
        pendingRef.current = change.shot.image;
        setOrigin(change.origin);
        setResolved(false);
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

  const stageStyle: CSSProperties & Record<"--ox" | "--oy", string> = {
    "--ox": `${origin.x * 100}%`,
    "--oy": `${origin.y * 100}%`,
    ...(size && {
      fontSize: `min(calc(100cqw / ${size.cols}), calc(100cqh / ${size.rows}))`,
    }),
  };

  return (
    <div
      aria-hidden="true"
      className={cn(
        "absolute inset-0 flex items-end justify-center @container-size",
        className,
      )}
    >
      <div
        data-resolved={resolved || undefined}
        className="glyph-stage relative"
        style={stageStyle}
      >
        {photo && (
          <div
            style={{ backgroundImage: `url("${photo}")` }}
            className={cn(
              "glyph-photo absolute inset-0 contrast-125 saturate-110",
              PHOTO,
            )}
          />
        )}
        <pre
          ref={preRef}
          className={cn(
            "glyph-text relative m-0 select-none whitespace-pre bg-clip-text font-mono font-semibold leading-none tracking-cell text-transparent",
            // Lifts the photo-colored glyphs off the page: darker on light, brighter on dark.
            "brightness-75 contrast-125 saturate-150 dark:brightness-125",
            PHOTO,
          )}
        />
      </div>
    </div>
  );
}
