import { useEffect, useMemo, useState } from "react";
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
  /** Entries behind each collection link, shown beside it. Keyed by href. */
  counts: Record<string, number>;
}

/**
 * Sticky nav: scroll-spy highlighting, entry counts beside collection links,
 * a live availability chip, the theme toggle and the ⌘K button. Below the
 * lg breakpoint the links fold into a menu panel under the bar.
 */
export function Header({
  site,
  sections,
  path,
  onOpenPalette,
  reducedMotion,
  hiddenPaths,
  counts,
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

  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const links = navItems.map((item) => {
    const current = item.href.startsWith("#")
      ? onHome && active === item.href.slice(1)
      : path === item.href || path.startsWith(`${item.href}/`);
    return (
      <a
        key={item.href}
        onClick={() => setMenuOpen(false)}
        href={homeAnchor(item.href, onHome)}
        aria-current={current ? "true" : undefined}
        className={cn(
          "whitespace-nowrap rounded-sm px-2.5 py-[7px] font-mono text-sm transition-colors duration-fast",
          "hover:bg-hover-tint hover:text-heading focus-visible:outline-solid focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent",
          current
            ? "text-heading underline decoration-2 underline-offset-8"
            : "text-subtle no-underline",
        )}
      >
        {item.label}
        {counts[item.href] !== undefined && (
          <sup
            aria-hidden="true"
            className="ml-0.5 font-mono text-2xs text-subtle"
          >
            {counts[item.href]}
          </sup>
        )}
      </a>
    );
  });

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
        className="absolute inset-x-0 -bottom-px h-px"
      >
        <span
          style={{ transform: `scaleX(${progress})` }}
          className="block h-full origin-left bg-accent"
        />
      </div>
      <div className="mx-auto flex h-header max-w-container items-center gap-3 px-container-pad">
        <a
          href={onHome ? `#${topId}` : "/"}
          className="stretch-expanded whitespace-nowrap font-display text-sm font-extrabold uppercase text-heading no-underline focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-accent"
        >
          {site.name}
        </a>
        <div className="flex-1" />
        <div className="no-scrollbar edge-fade hidden max-w-[70vw] gap-0.5 overflow-x-auto lg:flex">
          {links}
        </div>
        {site.availability && (
          <a
            href={homeAnchor(site.availability.href, onHome)}
            className="hidden shrink-0 items-center gap-2 whitespace-nowrap rounded-pill border border-control-border px-3 py-1 font-mono text-xs text-heading no-underline transition-colors duration-fast hover:bg-hover-tint focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent xl:inline-flex"
          >
            <span aria-hidden="true" className="relative flex h-2 w-2">
              <span className="absolute inset-0 animate-pulse-ring rounded-full bg-signal" />
              <span className="relative h-2 w-2 rounded-full bg-signal" />
            </span>
            {site.availability.label}
          </a>
        )}
        <ThemeToggle
          label={site.a11y.themeToggleLabel}
          reducedMotion={reducedMotion}
        />
        <button
          type="button"
          aria-expanded={menuOpen}
          aria-controls="site-menu"
          onClick={() => setMenuOpen((open) => !open)}
          className="cursor-pointer rounded-md border border-border-chip bg-surface-alt px-2.5 py-1.5 font-mono text-xs text-heading transition-colors duration-fast hover:border-ghost focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent lg:hidden"
        >
          {menuOpen ? site.a11y.menuCloseLabel : site.a11y.menuLabel}
        </button>
        <button
          type="button"
          onClick={onOpenPalette}
          aria-label={site.palette.buttonTitle}
          title={site.palette.buttonTitle}
          className="cursor-pointer rounded-md border border-border-chip bg-surface-alt px-[9px] py-[5px] font-mono text-xs text-subtle transition-colors duration-fast hover:border-ghost hover:text-heading focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {site.palette.buttonLabel}
        </button>
      </div>
      {menuOpen && (
        <div
          id="site-menu"
          className="absolute inset-x-0 top-full max-h-[calc(100dvh-var(--space-header-height))] overflow-y-auto border-b border-border-nav bg-background px-container-pad pb-6 pt-3 lg:hidden"
        >
          <div className="mx-auto grid max-w-container grid-cols-2 gap-1 sm:grid-cols-3">
            {links}
          </div>
          {site.availability && (
            <a
              href={homeAnchor(site.availability.href, onHome)}
              onClick={() => setMenuOpen(false)}
              className="mx-auto mt-4 flex max-w-container items-center gap-2 font-mono text-xs text-heading no-underline"
            >
              <span
                aria-hidden="true"
                className="h-2 w-2 rounded-full bg-signal"
              />
              {site.availability.label}
            </a>
          )}
        </div>
      )}
    </nav>
  );
}
