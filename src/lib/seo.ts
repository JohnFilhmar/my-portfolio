import type { SiteConfig } from "@config/schema";

const INDEX =
  "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";
const NOINDEX = "noindex, follow";

export interface SeoData {
  title: string;
  description: string;
  siteUrl: string;
  /** Absolute canonical URL of this page. */
  url: string;
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
  /** Content of the robots meta tag. */
  robots: string;
  /** Search titles by route, from site.json `seo.titles`. */
  titles: Record<string, string>;
  /**
   * Pre-serialized JSON-LD blocks, one <script> each: the site-wide graph
   * (Person + WebSite), then this page's own node (ProfilePage on home,
   * BreadcrumbList elsewhere).
   */
  jsonLd: string[];
}

/** Join the site origin with a possibly-relative path into an absolute URL. */
function absoluteUrl(siteUrl: string, path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${siteUrl.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

/**
 * Builds the home page metadata and structured data from site.json.
 *
 * @param site - Validated site config.
 * @param siteUrlRaw - Public origin, with or without a trailing slash.
 * @returns Metadata for the home page; `pageSeo` derives the others from it.
 */
export function buildSeo(site: SiteConfig, siteUrlRaw: string): SeoData {
  const siteUrl = siteUrlRaw.replace(/\/+$/, "");
  const title = `${site.name}: ${site.role}`;
  const image = absoluteUrl(siteUrl, site.seo.image);
  const imageAlt = site.seo.imageAlt || title;

  // The Person is the subject; `sameAs` wires the social profiles together
  // for knowledge-graph linking.
  const graph = JSON.stringify({
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
  const profile = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${siteUrl}/#profile`,
    url: siteUrl,
    name: title,
    mainEntity: { "@id": `${siteUrl}/#person` },
    isPartOf: { "@id": `${siteUrl}/#website` },
  });

  return {
    title,
    description: site.seo.description ?? site.description,
    siteUrl,
    url: siteUrl,
    siteName: site.name,
    ogTitle: title,
    ogDescription: site.tagline,
    locale: site.locale,
    image,
    imageAlt,
    keywords: site.seo.keywords.join(", "),
    twitterHandle: site.seo.twitterHandle ?? "",
    robots: INDEX,
    titles: site.seo.titles,
    jsonLd: [graph, profile],
  };
}

/**
 * Metadata for a page other than home: same site identity and social image,
 * with its own title, description, canonical URL and breadcrumb.
 *
 * @param base - The home metadata from `buildSeo`.
 * @param page.title - Fallback title when site.json `seo.titles` has no entry for `path`.
 * @param page.path - Root-relative route, e.g. "/work/usapp".
 * @param page.noindex - Keep the page out of search results, e.g. while it has no content.
 * @returns A copy of `base` with page-level fields replaced.
 */
export function pageSeo(
  base: SeoData,
  page: { title: string; description: string; path: string; noindex?: boolean },
): SeoData {
  const name = base.titles[page.path] ?? page.title;
  const title = `${name} · ${base.siteName}`;
  const url = absoluteUrl(base.siteUrl, page.path);
  const breadcrumb = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: base.siteName,
        item: base.siteUrl,
      },
      { "@type": "ListItem", position: 2, name, item: url },
    ],
  });
  return {
    ...base,
    title,
    ogTitle: title,
    description: page.description,
    ogDescription: page.description,
    url,
    robots: page.noindex ? NOINDEX : INDEX,
    jsonLd: [base.jsonLd[0] ?? "", breadcrumb],
  };
}
