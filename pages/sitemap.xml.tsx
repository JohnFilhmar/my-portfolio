import type { GetServerSideProps } from "next";
import { loadConfig } from "@config/index";
import { getSiteUrl } from "@/lib/env";
import {
  ASK_PATH,
  CERTIFICATIONS_PATH,
  NOTES_PATH,
  PROJECTS_PATH,
  RECOMMENDATIONS_PATH,
  notePath,
  workPath,
} from "@/lib/navigation";

/** /sitemap.xml: home, case studies, notes, credentials and the assistant page. */
export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const config = loadConfig();
  const siteUrl = getSiteUrl(config.site.siteUrl).replace(/\/+$/, "");
  const pages = [
    { path: "/", priority: "1.0" },
    ...config.projects.items
      .filter((item) => item.tier === "flagship")
      .map((item) => ({ path: workPath(item.id), priority: "0.8" })),
    ...(config.notes.posts.length > 0
      ? [
          { path: NOTES_PATH, priority: "0.6" },
          ...config.notes.posts.map((post) => ({
            path: notePath(post.slug),
            priority: "0.6",
          })),
        ]
      : []),
    { path: PROJECTS_PATH, priority: "0.7" },
    ...(config.recommendations.items.length > 0
      ? [{ path: RECOMMENDATIONS_PATH, priority: "0.6" }]
      : []),
    ...(config.certifications.items.length > 0
      ? [{ path: CERTIFICATIONS_PATH, priority: "0.5" }]
      : []),
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
