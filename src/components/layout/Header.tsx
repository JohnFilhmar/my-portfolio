import { useMemo } from "react";
import type { SiteConfig } from "@config/schema";
import type { ResolvedSection } from "@/lib/sections";
import { useScrollProgress } from "@/hooks/useScrollProgress";
import { useScrollSpy } from "@/hooks/useScrollSpy";
import { homeAnchor, visibleNav } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export interface HeaderProps {
  site: SiteConfig;
  /** Resolved home sections. Nav filters against them, spy follows them. */
  sections: ResolvedSection[];
  /** Current route, e.g. "/" or "/work/usapp". Anchors resolve against home. */
  path: string;
  onOpenPalette: () => void;
  reducedMotion: boolean;
  /** Page links to hide because the page has nothing to show yet. */
  hiddenPaths: string[];
}

/** Sticky command-prompt nav with scroll-spy highlighting and ⌘K button. */
export function Header({
  site,
  sections,
  path,
  onOpenPalette,
  reducedMotion,
  hiddenPaths,
}: HeaderProps) {
  const onHome = path === "/";
  const sectionIds = useMemo(() => sections.map((s) => s.id), [sections]);
  const topId = sections[0]?.id ?? "top";
  // Spy over sections in document order; hide nav links whose section is
  // disabled in the registry.
  const active = useScrollSpy(sectionIds);
  const progress = useScrollProgress();
  const navItems = useMemo(
    () => visibleNav(site.nav, sectionIds, hiddenPaths),
    [site.nav, sectionIds, hiddenPaths],
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
          href={onHome ? `#${topId}` : "/"}
          className="stretch-expanded whitespace-nowrap font-display text-sm font-extrabold uppercase text-heading no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-accent"
        >
          {site.name}
        </a>
        <div className="flex-1" />
        <div className="no-scrollbar edge-fade flex max-w-[70vw] gap-0.5 overflow-x-auto">
          {navItems.map((item) => {
            const current = item.href.startsWith("#")
              ? onHome && active === item.href.slice(1)
              : path === item.href || path.startsWith(`${item.href}/`);
            return (
              <a
                key={item.href}
                href={homeAnchor(item.href, onHome)}
                aria-current={current ? "true" : undefined}
                className={cn(
                  "whitespace-nowrap rounded-sm px-2.5 py-[7px] font-mono text-sm no-underline transition-colors duration-fast",
                  "hover:bg-hover-tint hover:text-heading focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent",
                  current
                    ? "text-heading underline decoration-2 underline-offset-8"
                    : "text-subtle",
                )}
              >
                {item.label}
              </a>
            );
          })}
        </div>
        <ThemeToggle
          label={site.a11y.themeToggleLabel}
          reducedMotion={reducedMotion}
        />
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
