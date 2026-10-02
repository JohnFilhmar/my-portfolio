import { useMemo } from "react";
import type { SiteConfig } from "@config/schema";
import type { ResolvedSection } from "@/lib/sections";
import { useScrollProgress } from "@/hooks/useScrollProgress";
import { useScrollSpy } from "@/hooks/useScrollSpy";
import { cn } from "@/lib/utils";

export interface HeaderProps {
  site: SiteConfig;
  /** Resolved (enabled) sections — nav filters against them, spy follows them. */
  sections: ResolvedSection[];
  onOpenPalette: () => void;
}

/** Sticky command-prompt nav with scroll-spy highlighting and ⌘K button. */
export function Header({ site, sections, onOpenPalette }: HeaderProps) {
  const sectionIds = useMemo(() => sections.map((s) => s.id), [sections]);
  const topId = sections[0]?.id ?? "top";
  // Spy over sections in document order; hide nav links whose section is
  // disabled in the registry.
  const active = useScrollSpy(sectionIds);
  const progress = useScrollProgress();
  const navItems = useMemo(
    () =>
      site.nav.filter(
        (item) =>
          !item.href.startsWith("#") || sectionIds.includes(item.href.slice(1)),
      ),
    [site.nav, sectionIds],
  );

  return (
    <nav
      aria-label="Main"
      className="sticky top-0 z-50 border-b border-border-nav bg-nav-veil backdrop-blur-lg"
    >
      {/* Reading progress sits on the header's own bottom edge. */}
      <div
        role="progressbar"
        aria-label={site.a11y.scrollProgressLabel}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress * 100)}
        className="absolute inset-x-0 bottom-[-1px] h-px"
      >
        <span
          style={{ transform: `scaleX(${progress})` }}
          className="block h-full origin-left bg-accent"
        />
      </div>
      <div className="mx-auto flex h-header max-w-container items-center gap-3 px-container-pad">
        <a
          href={`#${topId}`}
          className="whitespace-nowrap font-mono text-[13.5px] font-medium text-bright no-underline hover:text-heading focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-accent"
        >
          {site.prompt.user}
          <span className="text-accent">@</span>
          {site.prompt.host}
          <span className="text-dim">:~</span>
        </a>
        <div className="flex-1" />
        <div className="no-scrollbar edge-fade flex max-w-[70vw] gap-0.5 overflow-x-auto">
          {navItems.map((item) => {
            const id = item.href.replace(/^#/, "");
            return (
              <a
                key={item.href}
                href={item.href}
                aria-current={active === id ? "true" : undefined}
                className={cn(
                  "whitespace-nowrap rounded-sm px-2.5 py-[7px] font-mono text-sm no-underline transition-colors duration-fast",
                  "hover:bg-hover-tint hover:text-heading focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent",
                  active === id ? "text-accent" : "text-subtle",
                )}
              >
                {item.label}
              </a>
            );
          })}
        </div>
        <button
          type="button"
          onClick={onOpenPalette}
          aria-label={site.palette.buttonTitle}
          title={site.palette.buttonTitle}
          className="cursor-pointer rounded-md border border-border-chip bg-surface-alt px-[9px] py-[5px] font-mono text-xs text-subtle transition-colors duration-fast hover:border-ghost hover:text-heading focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {site.palette.buttonLabel}
        </button>
      </div>
    </nav>
  );
}
