import type { SiteConfig } from "@config/schema";

export interface SeoData {
  title: string;
  description: string;
  siteUrl: string;
  ogTitle: string;
  ogDescription: string;
  locale: string;
}

/** Build all page metadata from site.json (plus the resolved site URL). */
export function buildSeo(site: SiteConfig, siteUrl: string): SeoData {
  const title = `${site.name} — ${site.role}`;
  return {
    title,
    description: site.description,
    siteUrl,
    ogTitle: title,
    ogDescription: site.tagline,
    locale: site.locale,
  };
}
