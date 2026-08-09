import type { GetServerSideProps } from "next";
import { loadConfig } from "@config/index";
import { getSiteUrl } from "@/lib/env";

/** /sitemap.xml — single-page site, generated from the configured site URL. */
export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const config = loadConfig();
  const siteUrl = getSiteUrl(config.site.siteUrl).replace(/\/+$/, "");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`;
  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.write(xml);
  res.end();
  return { props: {} };
};

export default function Sitemap() {
  return null;
}
