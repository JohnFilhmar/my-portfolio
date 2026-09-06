import { useState } from "react";
import type { LightboxConfig, MediaItem } from "@config/schema";
import { ImageFrame } from "@/components/ui/ImageFrame";
import { Lightbox } from "@/components/ui/Lightbox";

export interface PhotoStripProps {
  photos: MediaItem[];
  /** Accessible name for the group, already interpolated. */
  groupLabel: string;
  labels: LightboxConfig;
}

/**
 * Row of small photos under a timeline entry, each opening full size in the
 * shared viewer. Renders nothing when the entry has no photos, which is what
 * keeps placeholder entries invisible until their file exists.
 */
export function PhotoStrip({ photos, groupLabel, labels }: PhotoStripProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (photos.length === 0) return null;

  const items = photos.map((photo, index) => ({
    id: `${photo.src}-${index}`,
    src: photo.src,
    alt: photo.alt,
    title: photo.src.split("/").pop() ?? photo.alt,
    caption: photo.caption || photo.alt,
    meta: "",
    aspect: photo.aspect,
  }));

  return (
    <>
      <ul
        aria-label={groupLabel}
        className="m-0 mt-3.5 flex list-none flex-wrap gap-2 p-0"
      >
        {photos.map((photo, index) => (
          <li key={`${photo.src}-${index}`}>
            <button
              type="button"
              onClick={() => setOpenIndex(index)}
              aria-label={photo.caption || photo.alt}
              className="block w-[112px] cursor-zoom-in overflow-hidden rounded-md border border-border-muted bg-transparent p-0 transition duration-base hover:border-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <ImageFrame
                src={photo.src}
                alt={photo.alt}
                aspect={photo.aspect}
                fallbackLabel={photo.caption || photo.alt}
              />
            </button>
          </li>
        ))}
      </ul>

      <Lightbox
        items={items}
        index={openIndex}
        onIndexChange={setOpenIndex}
        onClose={() => setOpenIndex(null)}
        labels={labels}
      />
    </>
  );
}
