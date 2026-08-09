import Head from "next/head";
import type { SeoData } from "@/lib/seo";

/** Populates title, description, canonical, Open Graph and Twitter tags. */
export function Seo({ seo, themeColor }: { seo: SeoData; themeColor: string }) {
  return (
    <Head>
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content={themeColor} />
      <link rel="canonical" href={seo.siteUrl} />
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />

      <meta property="og:type" content="website" />
      <meta property="og:url" content={seo.siteUrl} />
      <meta property="og:title" content={seo.ogTitle} />
      <meta property="og:description" content={seo.ogDescription} />
      <meta property="og:locale" content={seo.locale} />

      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={seo.ogTitle} />
      <meta name="twitter:description" content={seo.ogDescription} />
    </Head>
  );
}
