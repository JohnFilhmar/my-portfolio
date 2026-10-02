import type { SiteConfig } from "@config/schema";
import type { ResolvedSection } from "@/lib/sections";
import { homeAnchor, visibleNav } from "@/lib/navigation";

export interface FooterProps {
  site: SiteConfig;
  sections: ResolvedSection[];
  /** Current route. Anchors resolve against home everywhere else. */
  path: string;
  /** Page links to hide because the page has nothing to show yet. */
  hiddenPaths: string[];
}

/** Footer: prompt brand, note, quick nav (filtered like the header's). */
export function Footer({ site, sections, path, hiddenPaths }: FooterProps) {
  const navItems = visibleNav(
    site.nav,
    sections.map((s) => s.id),
    hiddenPaths,
  );
  return (
    <footer className="border-t border-border-nav bg-background-alt">
      <div className="mx-auto flex max-w-container flex-wrap items-start gap-6 px-container-pad py-9">
        <div className="min-w-[260px] flex-1 basis-[260px]">
          <p className="stretch-expanded m-0 mb-2 font-display text-sm font-extrabold uppercase text-heading">
            {site.name}
          </p>
          <p className="m-0 max-w-[40ch] text-[13px] leading-relaxed text-dim">
            {site.footer.note}
          </p>
        </div>
        <nav
          aria-label="Footer"
          className="flex flex-wrap items-center gap-x-[18px] gap-y-1"
        >
          {navItems.map((item) => (
            <a
              key={item.href}
              href={homeAnchor(item.href, path === "/")}
              className="font-mono text-sm text-subtle no-underline transition-colors duration-fast hover:text-accent"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <p className="m-0 basis-full font-mono text-xs text-ghost">
          {site.footer.copyright}
        </p>
      </div>
    </footer>
  );
}
