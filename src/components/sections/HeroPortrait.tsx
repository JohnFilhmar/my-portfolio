import { useState } from "react";
import type { HeroConfig } from "@config/schema";
import { ImageFrame } from "@/components/ui/ImageFrame";
import { cn } from "@/lib/utils";

export interface HeroPortraitProps {
  portrait: HeroConfig["portrait"];
  className?: string;
}

const LAYER = {
  active:
    "z-[2] opacity-100 [clip-path:inset(0)] transition-[clip-path] duration-reveal ease-standard",
  leaving: "z-[1] opacity-0 transition-opacity duration-reveal ease-standard",
  idle: "opacity-0 [clip-path:inset(100%_0_0_0)]",
} as const;

const IMG = "absolute inset-0 h-full w-full object-contain object-bottom";

/**
 * The hero photo, toned blue by the theme. Hover lifts it and fades in the
 * true color. With more than one photo in public/portrait, a click wipes the
 * next one up from the bottom while the current one fades out.
 */
export function HeroPortrait({ portrait, className }: HeroPortraitProps) {
  const { images, alt, cycleLabel, emptyLabel } = portrait;
  const [index, setIndex] = useState(0);
  const [previous, setPrevious] = useState<number | null>(null);

  if (images.length === 0) {
    return (
      <ImageFrame
        src="/portrait/"
        alt={alt}
        aspect="1/1"
        missing
        fallbackLabel={emptyLabel}
        className={className}
      />
    );
  }

  const cycles = images.length > 1;

  return (
    <figure
      className={cn(
        "group relative m-0 aspect-square max-h-[calc(100dvh-var(--space-header-height))] w-full animate-rise-in",
        className,
      )}
    >
      <div
        role="img"
        aria-label={alt}
        className="absolute inset-0 transition-transform duration-base ease-standard group-hover:-translate-y-2"
      >
        {images.map((src, i) => {
          const state =
            i === index ? "active" : i === previous ? "leaving" : "idle";
          return (
            <span
              key={src}
              aria-hidden="true"
              className={cn("absolute inset-0", LAYER[state])}
            >
              {/* Plain tags for the same reason as ImageFrame: no optimizer in the standalone image. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                loading={i === 0 ? "eager" : "lazy"}
                decoding="async"
                className={IMG}
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                loading={i === 0 ? "eager" : "lazy"}
                decoding="async"
                className={cn(
                  IMG,
                  "portrait-tint transition-opacity duration-base ease-standard group-hover:opacity-0",
                )}
              />
            </span>
          );
        })}
      </div>
      {cycles && (
        <>
          <button
            type="button"
            aria-label={`${cycleLabel} (${index + 1} of ${images.length})`}
            onClick={() => {
              setPrevious(index);
              setIndex((index + 1) % images.length);
            }}
            className="absolute inset-0 z-[3] cursor-pointer border-none bg-transparent focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
          />
          <figcaption
            aria-hidden="true"
            className="pointer-events-none absolute bottom-4 left-4 z-[4] rounded-sm bg-surface px-2 py-1 font-mono text-2xs text-heading"
          >
            {String(index + 1).padStart(2, "0")} /{" "}
            {String(images.length).padStart(2, "0")}
          </figcaption>
        </>
      )}
    </figure>
  );
}
