import type { SiteConfig } from "@config/schema";

export interface SeoData {
  title: string;
  description: string;
  siteUrl: string;
  siteName: string;
  ogTitle: string;
  ogDescription: string;
  locale: string;
  /** Absolute URL to the social card image (1200×630). */
  image: string;
  imageAlt: string;
  keywords: string;
  /** e.g. "@handle", or "" when not configured. */
  twitterHandle: string;
  /** Pre-serialized JSON-LD (schema.org @graph) for the <script> tag. */
  jsonLd: string;
}

/** Join the site origin with a possibly-relative path into an absolute URL. */
function absoluteUrl(siteUrl: string, path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${siteUrl.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

/** Build all page metadata + structured data from site.json. */
export function buildSeo(site: SiteConfig, siteUrlRaw: string): SeoData {
  const siteUrl = siteUrlRaw.replace(/\/+$/, "");
  const title = `${site.name}: ${site.role}`;
  const image = absoluteUrl(siteUrl, site.seo.image);
  const imageAlt = site.seo.imageAlt || title;

  // schema.org graph: a Person (the subject) + the WebSite it lives on.
  // `sameAs` wires the social profiles together for knowledge-graph linking.
  const jsonLd = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${siteUrl}/#person`,
        name: site.name,
        url: siteUrl,
        image,
        jobTitle: site.role,
        email: `mailto:${site.contact.email}`,
        description: site.description,
        sameAs: site.socials.map((s) => s.href),
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: site.name,
        description: site.description,
        inLanguage: site.locale.replace(/_/g, "-"),
        publisher: { "@id": `${siteUrl}/#person` },
      },
    ],
  });

  return {
    title,
    description: site.description,
    siteUrl,
    siteName: site.name,
    ogTitle: title,
    ogDescription: site.tagline,
    locale: site.locale,
    image,
    imageAlt,
    keywords: site.seo.keywords.join(", "),
    twitterHandle: site.seo.twitterHandle ?? "",
    jsonLd,
  };
}
