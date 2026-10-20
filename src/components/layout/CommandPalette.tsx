import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AppConfig } from "@config/schema";
import type { ResolvedSection } from "@/lib/sections";
import { scrollToId } from "@/lib/navigation";
import { useAssistantPanel } from "@/providers/AssistantProvider";
import { cn } from "@/lib/utils";

interface PaletteCommand {
  key: string;
  label: string;
  hint: string;
  run: () => void;
}

export interface CommandPaletteProps {
  config: AppConfig;
  sections: ResolvedSection[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reducedMotion: boolean;
}

const LISTBOX_ID = "command-palette-listbox";
const optionId = (key: string) => `palette-option-${key}`;

/**
 * ⌘K command palette — commands are generated from config, never hardcoded.
 * Keyboard model matches the reference: while open, Escape / arrows / Enter
 * are handled window-wide in the capture phase, so no other Escape listener
 * double-fires. Exposed to AT as a combobox + listbox.
 */
export function CommandPalette({
  config,
  sections,
  open,
  onOpenChange,
  reducedMotion,
}: CommandPaletteProps) {
  const { palette } = config.site;
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  // Every open starts with an empty query. Adjusting state during render on
  // a prop change avoids an extra effect-driven render.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setQuery("");
      setIndex(0);
    }
  }
  const inputRef = useRef<HTMLInputElement>(null);

  const close = useCallback(() => onOpenChange(false), [onOpenChange]);

  const { open: openAssistant } = useAssistantPanel();

  const commands = useMemo<PaletteCommand[]>(() => {
    const list: PaletteCommand[] = [];

    for (const section of sections) {
      if (!section.number || !section.label) continue;
      list.push({
        key: `goto-${section.id}`,
        label: `${palette.gotoPrefix}${section.label}`,
        hint: `§${section.number}`,
        run: () => scrollToId(section.id, reducedMotion),
      });
    }

    if (config.assistant.enabled) {
      list.push({
        key: "ask-assistant",
        label: palette.actions.askAssistant.label,
        hint: palette.actions.askAssistant.hint,
        run: openAssistant,
      });
    }

    list.push({
      key: "copy-email",
      label: palette.actions.copyEmail.label,
      hint: palette.actions.copyEmail.hint,
      run: () => {
        void navigator.clipboard?.writeText(config.site.contact.email);
      },
    });

    for (const social of config.site.socials) {
      list.push({
        key: `open-${social.label}`,
        label: `${palette.openPrefix}${social.label}`,
        hint: "↗",
        run: () => {
          window.open(social.href, "_blank", "noopener,noreferrer");
        },
      });
    }

    list.push({
      key: "open-resume",
      label: `${palette.openPrefix}${config.site.resume.label}`,
      hint: "↓",
      run: () => {
        window.open(config.site.resume.href, "_blank", "noopener,noreferrer");
      },
    });

    return list;
  }, [config, openAssistant, palette, reducedMotion, sections]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => c.label.toLowerCase().includes(q));
  }, [commands, query]);

  const runCommand = useCallback(
    (command: PaletteCommand | undefined) => {
      if (!command) return;
      close();
      command.run();
    },
    [close],
  );

  // Move focus in on open, and restore it on close.
  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement;
    inputRef.current?.focus();
    return () => {
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [open]);

  // Window-wide keyboard handling: ⌘K toggles from anywhere; while open,
  // Escape / arrows / Enter / Tab are captured before any other listener.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        event.stopPropagation();
        onOpenChange(!open);
        return;
      }
      if (!open) return;
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        close();
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        setIndex((i) => (filtered.length ? (i + 1) % filtered.length : 0));
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setIndex((i) =>
          filtered.length ? (i - 1 + filtered.length) % filtered.length : 0,
        );
      } else if (event.key === "Enter" && !event.isComposing) {
        event.preventDefault();
        runCommand(filtered[index]);
      } else if (event.key === "Tab") {
        // Minimal focus trap: the combobox input is the only tab stop.
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey, { capture: true });
    return () =>
      window.removeEventListener("keydown", onKey, { capture: true });
  }, [open, onOpenChange, close, filtered, index, runCommand]);

  if (!open) return null;

  const activeCommand = filtered[index];

  return (
    <div
      onClick={close}
      data-lenis-prevent
      className="fixed inset-0 z-100 bg-overlay backdrop-blur-xs"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={palette.buttonTitle}
        onClick={(e) => e.stopPropagation()}
        className="mx-auto mt-[12vh] max-w-[580px] px-4"
      >
        <div className="overflow-hidden rounded-xl border border-border-strong bg-surface shadow-modal">
          <div className="flex items-center gap-2.5 border-b border-border px-4 py-3.5">
            <span aria-hidden="true" className="font-mono text-sm text-accent">
              &gt;
            </span>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIndex(0);
              }}
              role="combobox"
              aria-expanded="true"
              aria-controls={LISTBOX_ID}
              aria-activedescendant={
                activeCommand ? optionId(activeCommand.key) : undefined
              }
              aria-autocomplete="list"
              aria-label={palette.inputAriaLabel}
              placeholder={palette.placeholder}
              className="min-w-0 flex-1 border-none bg-transparent font-mono text-[15px] text-bright caret-accent outline-hidden placeholder:text-dim"
            />
            <span className="rounded-xs border border-border-chip px-1.5 py-0.5 font-mono text-2xs text-dim">
              {palette.escLabel}
            </span>
          </div>
          <div
            id={LISTBOX_ID}
            role="listbox"
            aria-label={palette.inputAriaLabel}
            className="max-h-[320px] overflow-y-auto p-1.5"
          >
            {filtered.map((command, i) => (
              <button
                key={command.key}
                id={optionId(command.key)}
                type="button"
                role="option"
                aria-selected={i === index}
                tabIndex={-1}
                onClick={() => runCommand(command)}
                onMouseEnter={() => setIndex(i)}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-2.5 rounded-lg border-none px-3 py-2.5 text-left",
                  i === index
                    ? "bg-accent-selected"
                    : "bg-transparent hover:bg-hover-tint",
                )}
              >
                <span
                  className={cn(
                    "font-mono text-[13px]",
                    i === index ? "text-accent" : "text-foreground",
                  )}
                >
                  {command.label}
                </span>
                <span className="flex-1" />
                <span className="font-mono text-2xs text-dim">
                  {command.hint}
                </span>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="m-0 px-3 py-3.5 font-mono text-sm text-dim">
                {palette.emptyMessage}
              </p>
            )}
          </div>
          <p className="m-0 border-t border-border px-4 py-2.5 font-mono text-2xs text-dim">
            {palette.footerHint}
          </p>
        </div>
      </div>
    </div>
  );
}
