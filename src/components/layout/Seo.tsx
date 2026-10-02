import Head from "next/head";
import type { SeoData } from "@/lib/seo";

/** Populates title, description, canonical, Open Graph, Twitter and JSON-LD. */
export function Seo({ seo, themeColor }: { seo: SeoData; themeColor: string }) {
  const hasTwitter = seo.twitterHandle.length > 0;
  return (
    <Head>
      {/* Core */}
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      {seo.keywords && <meta name="keywords" content={seo.keywords} />}
      <meta name="author" content={seo.siteName} />
      <meta
        name="robots"
        content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
      />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content={themeColor} />
      <link rel="canonical" href={seo.url} />

      {/* Icons */}
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      <link rel="apple-touch-icon" href="/favicon.svg" />

      {/* Open Graph (Facebook, LinkedIn, Discord, Slack, …) */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={seo.siteName} />
      <meta property="og:url" content={seo.url} />
      <meta property="og:title" content={seo.ogTitle} />
      <meta property="og:description" content={seo.ogDescription} />
      <meta property="og:locale" content={seo.locale} />
      <meta property="og:image" content={seo.image} />
      <meta property="og:image:secure_url" content={seo.image} />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={seo.imageAlt} />

      {/* Twitter / X */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.ogTitle} />
      <meta name="twitter:description" content={seo.ogDescription} />
      <meta name="twitter:image" content={seo.image} />
      <meta name="twitter:image:alt" content={seo.imageAlt} />
      {hasTwitter && <meta name="twitter:site" content={seo.twitterHandle} />}
      {hasTwitter && <meta name="twitter:creator" content={seo.twitterHandle} />}

      {/* Structured data (schema.org) for Google rich results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: seo.jsonLd }}
      />
    </Head>
  );
}
