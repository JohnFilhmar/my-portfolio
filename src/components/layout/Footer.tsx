import type { SiteConfig } from "@config/schema";
import type { ResolvedSection } from "@/lib/sections";

export interface FooterProps {
  site: SiteConfig;
  sections: ResolvedSection[];
}

/** Footer: prompt brand, note, quick nav (filtered to enabled sections). */
export function Footer({ site, sections }: FooterProps) {
  const sectionIds = sections.map((s) => s.id);
  const navItems = site.nav.filter(
    (item) =>
      !item.href.startsWith("#") || sectionIds.includes(item.href.slice(1)),
  );
  return (
    <footer className="border-t border-border-nav bg-background-alt">
      <div className="mx-auto flex max-w-container flex-wrap items-start gap-6 px-container-pad py-9">
        <div className="min-w-[260px] flex-1 basis-[260px]">
          <p className="m-0 mb-2 font-mono text-[13px] text-bright">
            {site.prompt.user}
            <span className="text-accent">@</span>
            {site.prompt.host}
            <span className="text-dim">:~</span>
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
              href={item.href}
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
