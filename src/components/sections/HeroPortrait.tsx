import { useState, type CSSProperties } from "react";
import type { HeroConfig } from "@config/schema";
import { PlaceholderArt } from "@/components/ui/PlaceholderArt";
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

/** The angle the backdrop's light comes from for each photo, cycling. */
const LIGHT = ["160deg", "215deg", "120deg"];

/**
 * The hero photo, toned blue by the theme, standing in a grain-textured
 * frame its head rises out of. Hover lifts it and fades in the true color.
 * With more than one photo in public/portrait, a click wipes the next one up
 * from the bottom and moves the light in the frame. Until photos exist, the
 * same frame cycles through drawn placeholders, so the layout can be judged.
 */
export function HeroPortrait({ portrait, className }: HeroPortraitProps) {
  const { images, alt, cycleLabel, emptyLabel, placeholderCount } = portrait;
  const [index, setIndex] = useState(0);
  const [previous, setPrevious] = useState<number | null>(null);
  const empty = images.length === 0;
  const slots: Array<string | null> = empty
    ? Array.from({ length: placeholderCount }, () => null)
    : images;
  const total = slots.length;
  const cycles = total > 1;
  const light: CSSProperties & Record<"--ga", string> = {
    "--ga": LIGHT[index % LIGHT.length] ?? "160deg",
  };

  return (
    <figure
      className={cn(
        "group relative m-0 aspect-square w-full max-w-[calc(100dvh-var(--space-header-height)-var(--space-hero-top))] animate-rise-in",
        className,
      )}
    >
      <div
        aria-hidden="true"
        style={light}
        className="portrait-backdrop absolute inset-x-[6%] bottom-0 top-[18%] rounded-3xl"
      />
      <div
        role="img"
        aria-label={alt}
        className="absolute inset-0 transition-transform duration-base ease-standard group-hover:-translate-y-2"
      >
        {slots.map((src, i) => {
          const state =
            i === index ? "active" : i === previous ? "leaving" : "idle";
          return (
            <span
              key={src ?? `slot-${i}`}
              aria-hidden="true"
              className={cn("absolute inset-0", LAYER[state])}
            >
              {src === null ? (
                <PlaceholderArt
                  kind="person"
                  label={emptyLabel}
                  path={`assets/portrait/${String(i + 1).padStart(2, "0")}.png`}
                  plain
                  className="text-heading"
                />
              ) : (
                <>
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
                </>
              )}
            </span>
          );
        })}
      </div>
      {cycles && (
        <>
          <button
            type="button"
            aria-label={`${cycleLabel} (${index + 1} of ${total})`}
            onClick={() => {
              setPrevious(index);
              setIndex((index + 1) % total);
            }}
            className="absolute inset-0 z-[3] cursor-pointer border-none bg-transparent focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
          />
          <figcaption
            aria-hidden="true"
            className="pointer-events-none absolute bottom-4 left-[calc(6%+1rem)] z-[4] rounded-sm bg-surface px-2 py-1 font-mono text-2xs text-heading"
          >
            {String(index + 1).padStart(2, "0")} /{" "}
            {String(total).padStart(2, "0")}
          </figcaption>
        </>
      )}
    </figure>
  );
}
