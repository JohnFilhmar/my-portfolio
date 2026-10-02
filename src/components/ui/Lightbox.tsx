import { useCallback, useEffect, useRef } from "react";
import type { LightboxConfig } from "@config/schema";
import { ImageFrame } from "@/components/ui/ImageFrame";
import { cn, isExternalHref } from "@/lib/utils";

export interface LightboxItem {
  id: string;
  src: string;
  alt: string;
  title: string;
  caption: string;
  meta: string;
  href?: string;
  aspect: string;
}

export interface LightboxProps {
  items: LightboxItem[];
  /** null closes the dialog. */
  index: number | null;
  onIndexChange: (index: number) => void;
  onClose: () => void;
  labels: LightboxConfig;
}

/**
 * Full-size viewer for the evidence tiles, dressed as a terminal window so it
 * belongs to the rest of the page. Keyboard model mirrors the command palette:
 * while open, Escape / arrows / Tab are handled window-wide on the capture
 * phase so no other listener on the page can double-fire.
 */
export function Lightbox({
  items,
  index,
  onIndexChange,
  onClose,
  labels,
}: LightboxProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const open = index !== null;
  const total = items.length;
  const current = index === null ? undefined : items[index];

  const step = useCallback(
    (delta: number) => {
      if (index === null || total === 0) return;
      onIndexChange((index + delta + total) % total);
    },
    [index, onIndexChange, total],
  );

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement;
    closeRef.current?.focus();
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        onClose();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        step(1);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        step(-1);
      }
    };
    window.addEventListener("keydown", onKey, { capture: true });
    return () =>
      window.removeEventListener("keydown", onKey, { capture: true });
  }, [open, onClose, step]);

  if (!open || !current || index === null) return null;

  const counter = labels.counterTemplate
    .replace("{i}", String(index + 1))
    .replace("{n}", String(total));

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[120] overflow-y-auto bg-overlay px-4 py-[6vh] backdrop-blur-sm"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={current.caption}
        onClick={(event) => event.stopPropagation()}
        className="mx-auto w-full max-w-[1000px] overflow-hidden rounded-xl border border-border-strong bg-surface shadow-modal"
      >
        <div className="flex items-center gap-2 border-b border-border px-3.5 py-[11px]">
          <span
            aria-hidden="true"
            className="h-2.5 w-2.5 rounded-full bg-dot"
          />
          <span
            aria-hidden="true"
            className="h-2.5 w-2.5 rounded-full bg-dot"
          />
          <span
            aria-hidden="true"
            className="h-2.5 w-2.5 rounded-full bg-accent-dot"
          />
          <span className="ml-1.5 truncate font-mono text-xs text-dim">
            {current.title}
          </span>
          <span className="flex-1" />
          <span className="font-mono text-2xs text-dim">{counter}</span>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={labels.closeLabel}
            className="ml-1 cursor-pointer rounded-xs border border-border-chip bg-surface px-1.5 py-0.5 font-mono text-2xs text-subtle transition-colors duration-fast hover:border-accent hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            esc
          </button>
        </div>

        <div className="relative bg-background-alt">
          <ImageFrame
            src={current.src}
            alt={current.alt}
            aspect={current.aspect}
            fit="contain"
            eager
            fallbackLabel={current.title}
            className="max-h-[68vh]"
          />
          {total > 1 && (
            <>
              <StepButton
                side="left"
                label={labels.prevLabel}
                onClick={() => step(-1)}
              />
              <StepButton
                side="right"
                label={labels.nextLabel}
                onClick={() => step(1)}
              />
            </>
          )}
        </div>

        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1.5 border-t border-border px-4 py-3.5">
          <p className="m-0 text-base text-bright">{current.caption}</p>
          {current.meta && (
            <p className="m-0 font-mono text-2xs text-dim">{current.meta}</p>
          )}
          <span className="flex-1" />
          {current.href && (
            <a
              href={current.href}
              {...(isExternalHref(current.href)
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              className="font-mono text-sm text-accent no-underline hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {labels.visitLabel} ↗
            </a>
          )}
          <p className="m-0 basis-full font-mono text-2xs text-ghost">
            {labels.hint}
          </p>
        </div>
      </div>
    </div>
  );
}

function StepButton({
  side,
  label,
  onClick,
}: {
  side: "left" | "right";
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "absolute top-1/2 -translate-y-1/2 cursor-pointer rounded-lg border border-border-strong bg-launcher-veil px-3 py-2.5 font-mono text-md text-bright",
        "transition-colors duration-fast hover:border-accent hover:text-accent",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        side === "left" ? "left-3" : "right-3",
      )}
    >
      {side === "left" ? "←" : "→"}
    </button>
  );
}
