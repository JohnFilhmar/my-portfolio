import { cn } from "@/lib/utils";

/** What a slot will hold, which decides the drawing that stands in for it. */
export type PlaceholderKind = "phone" | "screen" | "photo" | "person";

/**
 * Picks a stand-in drawing from a slot's CSS aspect ratio.
 *
 * @param aspect - e.g. "9/19.5", "16/10", "4/3". Unreadable values count as a photo.
 * @returns "phone" for tall slots, "screen" for wide ones, "photo" otherwise.
 */
export function kindForAspect(aspect: string): PlaceholderKind {
  const [w, h] = aspect.split("/").map(Number);
  if (!w || !h) return "photo";
  const ratio = w / h;
  if (ratio < 0.75) return "phone";
  if (ratio >= 1.45) return "screen";
  return "photo";
}

const STROKE = "stroke-current";
const SOFT = "fill-current opacity-15";
const SOLID = "fill-current opacity-30";

function Drawing({ kind }: { kind: PlaceholderKind }) {
  switch (kind) {
    case "phone":
      return (
        <svg viewBox="0 0 60 120" className="h-[78%] max-h-full">
          <rect
            x="2"
            y="2"
            width="56"
            height="116"
            rx="9"
            className={cn(STROKE, "fill-none")}
            strokeWidth="2"
          />
          <rect x="22" y="7" width="16" height="4" rx="2" className={SOLID} />
          <rect x="8" y="18" width="44" height="10" rx="2" className={SOLID} />
          {[34, 48, 62, 76].map((y) => (
            <g key={y}>
              <circle cx="13" cy={y + 4} r="4" className={SOLID} />
              <rect
                x="21"
                y={y + 1}
                width="28"
                height="3"
                rx="1.5"
                className={SOLID}
              />
              <rect
                x="21"
                y={y + 6}
                width="18"
                height="2.5"
                rx="1.2"
                className={SOFT}
              />
            </g>
          ))}
          <rect x="8" y="102" width="44" height="9" rx="4.5" className={SOFT} />
        </svg>
      );
    case "screen":
      return (
        <svg viewBox="0 0 160 100" className="w-[78%] max-w-full">
          <rect
            x="2"
            y="2"
            width="156"
            height="96"
            rx="5"
            className={cn(STROKE, "fill-none")}
            strokeWidth="2"
          />
          <rect x="2" y="2" width="156" height="12" rx="5" className={SOFT} />
          <rect x="8" y="20" width="30" height="72" rx="2" className={SOFT} />
          {[0, 1, 2].map((i) => (
            <rect
              key={i}
              x={46 + i * 37}
              y="20"
              width="31"
              height="30"
              rx="2"
              className={SOLID}
            />
          ))}
          <rect x="46" y="56" width="105" height="36" rx="2" className={SOFT} />
        </svg>
      );
    case "person":
      return (
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMax meet"
          className="h-full w-full"
        >
          <path
            d="M8 100 C8 74 26 66 50 66 C74 66 92 74 92 100 Z"
            className={SOLID}
          />
          <rect x="44" y="52" width="12" height="16" className={SOLID} />
          <ellipse cx="50" cy="40" rx="15" ry="18" className={SOLID} />
        </svg>
      );
    case "photo":
      return (
        <svg viewBox="0 0 120 90" className="w-[62%] max-w-full">
          <rect
            x="2"
            y="2"
            width="116"
            height="86"
            rx="4"
            className={cn(STROKE, "fill-none")}
            strokeWidth="2"
          />
          <circle cx="88" cy="26" r="9" className={SOLID} />
          <path d="M8 82 L42 44 L62 64 L78 50 L112 82 Z" className={SOLID} />
        </svg>
      );
  }
}

export interface PlaceholderArtProps {
  kind: PlaceholderKind;
  /** What belongs here, e.g. "Usapp screen 2". */
  label: string;
  /** Where the real file goes, shown so the slot says how to fill it. */
  path?: string;
  /** 1-based slot number and how many slots there are, e.g. 2 of 5. */
  slot?: { index: number; total: number };
  /** Drawing and path only, on a transparent ground (for framed slots). */
  plain?: boolean;
  className?: string;
}

/**
 * A drawing of what will fill an empty image slot (a phone screen, a desktop
 * screen, a photo or a person), with the slot's label and file path. Empty
 * slots then show the finished layout instead of a blank box.
 */
export function PlaceholderArt({
  kind,
  label,
  path,
  slot,
  plain = false,
  className,
}: PlaceholderArtProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 flex flex-col items-center justify-center gap-3 overflow-hidden px-4 pb-10 pt-6 text-border-strong",
        !plain && "placeholder-field",
        kind === "person" && "justify-end p-0",
        className,
      )}
    >
      <Drawing kind={kind} />
      {!plain && (
        <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-2 font-mono text-2xs">
          <span className="min-w-0 break-words rounded-xs bg-surface px-2 py-1 text-subtle">
            {label}
          </span>
          {slot && (
            <span className="shrink-0 rounded-xs bg-surface px-2 py-1 text-heading">
              {String(slot.index).padStart(2, "0")} /{" "}
              {String(slot.total).padStart(2, "0")}
            </span>
          )}
        </div>
      )}
      {path && (
        <span className="absolute inset-x-3 top-3 break-all font-mono text-2xs text-dim">
          {path}
        </span>
      )}
    </div>
  );
}
