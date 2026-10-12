import { useState } from "react";
import {
  PlaceholderArt,
  kindForAspect,
  type PlaceholderKind,
} from "@/components/ui/PlaceholderArt";
import { cn } from "@/lib/utils";

export interface ImageFrameProps {
  src: string;
  alt: string;
  /** CSS aspect-ratio for the box, e.g. "16/10" or "9/16". */
  aspect?: string;
  /** Shown instead of the picture if the file cannot be decoded. */
  fallbackLabel?: string;
  /**
   * The config loader found no file at `src`. Renders a placeholder that names
   * the path and ratio to upload, without requesting the missing file.
   */
  missing?: boolean;
  /** Drawing for the empty slot; guessed from `aspect` when omitted. */
  placeholderKind?: PlaceholderKind;
  /** Slot position for the empty state, e.g. image 2 of 5. */
  slot?: { index: number; total: number };
  /** `cover` crops to fill the box; `contain` shows the whole picture. */
  fit?: "cover" | "contain";
  /** Skip lazy loading for the first tiles, which are usually above the fold. */
  eager?: boolean;
  className?: string;
  imgClassName?: string;
}

/**
 * Fixed-ratio picture box. The inset background is painted by the wrapper and
 * the image simply covers it once decoded, so the layout is stable and nothing
 * depends on JavaScript for the normal path. A slot the loader marked
 * `missing` renders its placeholder on the server; the client-side swap on a
 * 404 or decode failure stays as the last resort.
 */
export function ImageFrame({
  src,
  alt,
  aspect = "16/10",
  fallbackLabel,
  missing = false,
  fit = "cover",
  eager = false,
  className,
  imgClassName,
  placeholderKind,
  slot,
}: ImageFrameProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      style={{ aspectRatio: aspect }}
      className={cn(
        "relative w-full overflow-hidden bg-surface-inset",
        className,
      )}
    >
      {missing ? (
        <div role="img" aria-label={alt}>
          <PlaceholderArt
            kind={placeholderKind ?? kindForAspect(aspect)}
            label={fallbackLabel ?? alt}
            path={`${src} · ${aspect.replace("/", ":")}`}
            slot={slot}
          />
        </div>
      ) : failed ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 px-4 text-center">
          <span aria-hidden="true" className="font-mono text-lg text-ghost">
            ▨
          </span>
          <span className="font-mono text-2xs text-dim">
            {fallbackLabel ?? alt}
          </span>
        </div>
      ) : (
        // next/image is skipped on purpose: the production image is the
        // `output: standalone` server (see Dockerfile), where the optimizer
        // depends on sharp being traced into the runtime layer. A plain tag
        // cannot fail that way, the ratio box already prevents layout shift,
        // and the shipped captures are pre-sized WebP.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          onError={() => setFailed(true)}
          className={cn(
            "absolute inset-0 h-full w-full",
            fit === "cover" ? "object-cover" : "object-contain",
            imgClassName,
          )}
        />
      )}
    </div>
  );
}
