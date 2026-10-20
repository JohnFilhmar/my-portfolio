import type { MediaItem } from "@config/schema";
import { ImageFrame } from "@/components/ui/ImageFrame";
import { cn } from "@/lib/utils";

export interface ShotGridProps {
  shots: MediaItem[];
  /** Accessible name for a picture's open button. `{title}` is replaced. */
  openLabelTemplate: string;
  /** Opens the full-size viewer on the shot whose `src` is given. */
  onOpen: (src: string) => void;
}

/** Ratio below this reads as a portrait shot, held to a narrower column. */
const PORTRAIT_RATIO = 0.9;

function isPortrait(aspect: string): boolean {
  const [w, h] = aspect.split("/").map(Number);
  return w !== undefined && h !== undefined && h > 0 && w / h < PORTRAIT_RATIO;
}

/**
 * Grid of screens and diagrams with captions. Landscape pictures span the full
 * width and portrait ones (phone screens) pair up side by side, so a diagram
 * never sits next to a screen three times its height. Real pictures open full
 * size; a slot without a file shows its placeholder and is not clickable.
 */
export function ShotGrid({ shots, openLabelTemplate, onOpen }: ShotGridProps) {
  return (
    <div className="mt-6 grid gap-x-column-gap gap-y-10 md:grid-cols-2">
      {shots.map((shot) => {
        const portrait = isPortrait(shot.aspect);
        const label = shot.caption || shot.alt;
        const frame = (
          <ImageFrame
            src={shot.src}
            alt={shot.alt}
            aspect={shot.aspect}
            missing={shot.missing}
            fallbackLabel={label}
            fit={portrait ? "contain" : "cover"}
            className="rounded-xl border border-border"
          />
        );
        return (
          <figure
            key={shot.src}
            className={cn(
              "m-0 min-w-0",
              portrait ? "mx-auto w-full max-w-[320px]" : "md:col-span-2",
            )}
          >
            {shot.missing ? (
              frame
            ) : (
              <button
                type="button"
                onClick={() => onOpen(shot.src)}
                aria-label={openLabelTemplate.replace("{title}", label)}
                className="block w-full cursor-zoom-in border-none bg-transparent p-0 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                {frame}
              </button>
            )}
            {shot.caption && (
              <figcaption className="mt-3 font-mono text-sm text-subtle">
                {shot.caption}
              </figcaption>
            )}
          </figure>
        );
      })}
    </div>
  );
}
