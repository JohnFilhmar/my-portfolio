import type { GetServerSideProps } from "next";
import { loadConfig } from "@config/index";
import { getSiteUrl } from "@/lib/env";
import { ASK_PATH, workPath } from "@/lib/navigation";

/** /sitemap.xml: home, each flagship case study, and the assistant page. */
export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const config = loadConfig();
  const siteUrl = getSiteUrl(config.site.siteUrl).replace(/\/+$/, "");
  const pages = [
    { path: "/", priority: "1.0" },
    ...config.projects.items
      .filter((item) => item.tier === "flagship")
      .map((item) => ({ path: workPath(item.id), priority: "0.8" })),
    ...(config.assistant.enabled ? [{ path: ASK_PATH, priority: "0.5" }] : []),
  ];
  const urls = pages
    .map(
      (page) => `  <url>
    <loc>${siteUrl}${page.path}</loc>
    <changefreq>monthly</changefreq>
    <priority>${page.priority}</priority>
  </url>`,
    )
    .join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
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
