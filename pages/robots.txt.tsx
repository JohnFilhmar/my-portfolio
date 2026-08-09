import type { GetServerSideProps } from "next";
import { loadConfig } from "@config/index";
import { getSiteUrl } from "@/lib/env";

/** /robots.txt — generated from config so the sitemap URL stays correct. */
export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  const config = loadConfig();
  const siteUrl = getSiteUrl(config.site.siteUrl).replace(/\/+$/, "");
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.write(`User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`);
  res.end();
  return { props: {} };
};

export default function Robots() {
  return null;
}
