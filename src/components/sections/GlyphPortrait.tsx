import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { PortraitShot } from "@config/schema";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import {
  glyphGridSchema,
  gridLevels,
  type GlyphGrid,
} from "@/lib/glyphPortrait/grid";
import {
  blockText,
  rampSteps,
  resampleLevels,
} from "@/lib/glyphPortrait/resample";
import { cn } from "@/lib/utils";

/** How a change plays: the first slow build, a click's pulse, or a hover swap. */
export type GlyphMode = "build" | "pulse" | "swap";

/** One requested change of portrait. A new object starts a new build. */
export interface GlyphChange {
  shot: PortraitShot;
  /** Where the photo dissolves and reveals from, as fractions of the frame (0-1). */
  origin: { x: number; y: number };
  mode: GlyphMode;
}

export interface GlyphPortraitProps {
  change: GlyphChange;
  /** Photos to fetch in the background once the first one shows. */
  preload: readonly PortraitShot[];
  className?: string;
}

/** Steps and milliseconds per step: the first build is slow, later changes quick. */
const PACE: Record<GlyphMode, { steps: number; ms: number }> = {
  build: { steps: 18, ms: 150 },
  pulse: { steps: 10, ms: 90 },
  swap: { steps: 10, ms: 90 },
};
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

const photos = new Map<string, Promise<number>>();

/** Loads and decodes a photo once per URL, so blocks never render uncolored. */
function loadPhoto(src: string): Promise<number> {
  const cached = photos.get(src);
  if (cached) return cached;
  const image = new Image();
  image.src = src;
  const request = image
    .decode()
    .then(() => image.naturalWidth / image.naturalHeight);
  request.catch(() => photos.delete(src));
  photos.set(src, request);
  return request;
}

/**
 * Stretches the block text so `step` fills the square stage: a non-uniform
 * scale makes every block cover its whole cell at any column count and cell
 * aspect. The photo behind the text (`background-clip: text`) is laid out in
 * the text's unscaled coordinates so that, once scaled, it sits exactly where
 * a bottom-aligned "contain" photo would in the square.
 */
function fitBlocks(stage: HTMLElement, pre: HTMLElement, aspect: number): void {
  const side = stage.clientWidth;
  const sx = side / pre.offsetWidth;
  const sy = side / pre.offsetHeight;
  const imageW = aspect <= 1 ? side * aspect : side;
  const imageH = aspect <= 1 ? side : side / aspect;
  pre.style.transform = `scale(${sx}, ${sy})`;
  pre.style.backgroundSize = `${imageW / sx}px ${imageH / sy}px`;
  pre.style.backgroundPosition = `${(side - imageW) / 2 / sx}px ${(side - imageH) / sy}px`;
}

/**
 * A portrait that arrives as block characters and resolves into the real
 * photo. Each `change` dissolves the photo in a feathered wave from its
 * origin, then rebuilds the picture in blocks colored by the photo
 * (`background-clip: text`), stepping from 40 columns at cell aspect 0.40 up
 * to the full grid, and finally reveals the photo in a wave from the same
 * origin (masks in globals.css under `.glyph-stage`). With reduced motion it
 * goes straight to the photo.
 */
export function GlyphPortrait({
  change,
  preload,
  className,
}: GlyphPortraitProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  /** Width over height of the photo currently coloring the blocks. */
  const aspectRef = useRef(1);
  const reducedRef = useRef(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [resolved, setResolved] = useState(false);
  const [origin, setOrigin] = useState(change.origin);
  const reduced = useReducedMotion();

  useEffect(() => {
    reducedRef.current = reduced;
  }, [reduced]);

  useEffect(() => {
    const stage = stageRef.current;
    const pre = preRef.current;
    if (!stage || !pre) return;
    const observer = new ResizeObserver(() => {
      if (pre.textContent) fitBlocks(stage, pre, aspectRef.current);
    });
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;
    let timer = 0;
    Promise.all([loadGrid(change.shot.glyphs), loadPhoto(change.shot.image)])
      .then(([grid, aspect]) => {
        const stage = stageRef.current;
        const pre = preRef.current;
        if (cancelled || !stage || !pre) return;
        aspectRef.current = aspect;
        const levels = gridLevels(grid);
        const full = { cols: grid.cols, rows: grid.rows };
        const pace = PACE[change.mode];
        const steps = reducedRef.current
          ? [full]
          : rampSteps(pace.steps, grid.cols);
        pre.style.backgroundImage = `url("${change.shot.image}")`;
        setOrigin(change.origin);
        setResolved(false);
        const show = (i: number) => {
          if (cancelled) return;
          const step = steps[i];
          if (!step) {
            setPhoto(change.shot.image);
            setResolved(true);
            return;
          }
          pre.textContent = blockText(resampleLevels(levels, full, step), step);
          fitBlocks(stage, pre, aspect);
          timer = window.setTimeout(() => show(i + 1), pace.ms);
        };
        // Two frames for the new background to paint, so the coarsest step
        // never shows as uncolored (invisible) blocks.
        requestAnimationFrame(() => requestAnimationFrame(() => show(0)));
      })
      .catch(() => {
        // A missing grid leaves the portrait as it is; the next change retries.
      });
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
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
        ref={stageRef}
        data-resolved={resolved || undefined}
        style={stageStyle}
        className="glyph-stage relative aspect-square w-[min(100cqw,100cqh)] overflow-hidden"
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
            "glyph-text absolute bottom-0 left-0 m-0 origin-bottom-left select-none whitespace-pre bg-no-repeat bg-clip-text font-blocks text-[16px] leading-[0.82] tracking-[-0.04em] text-transparent",
            // Rows and columns overlap slightly: block glyphs stop short of their cell, which left seams.
            // Lifts the photo-colored blocks off the page: darker on light, brighter on dark.
            "brightness-75 contrast-125 saturate-150 dark:brightness-125",
          )}
        />
      </div>
    </div>
  );
}
