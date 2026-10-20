import assert from "node:assert/strict";
import { test } from "node:test";
import { siteSchema } from "../../config/schema.ts";
import siteJson from "../../config/site.json" with { type: "json" };
import { buildSeo, pageSeo } from "./seo.ts";

const site = siteSchema.parse(siteJson);
const home = buildSeo(site, "https://example.test/");

test("home is an indexable ProfilePage with a description search results show whole", () => {
  assert.match(home.robots, /^index/);
  assert.ok(home.description.length <= 160, `${home.description.length} chars`);
  const types = home.jsonLd.map((b) => JSON.parse(b)["@type"] ?? "graph");
  assert.deepEqual(types, ["graph", "ProfilePage"]);
});

test("subpages take their search title from site.json and get a breadcrumb", () => {
  const page = pageSeo(home, {
    title: "projects",
    description: "d",
    path: "/projects",
  });
  assert.equal(page.title, `${site.seo.titles["/projects"]} · ${site.name}`);
  assert.equal(page.url, "https://example.test/projects");
  const crumb = JSON.parse(page.jsonLd[1] ?? "{}");
  assert.equal(crumb["@type"], "BreadcrumbList");
  assert.equal(crumb.itemListElement[1].item, page.url);
});

test("an empty page is kept out of search results", () => {
  const page = pageSeo(home, {
    title: "notes",
    description: "d",
    path: "/notes",
    noindex: true,
  });
  assert.equal(page.robots, "noindex, follow");
});
