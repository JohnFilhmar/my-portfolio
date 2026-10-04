import assert from "node:assert/strict";
import crypto from "node:crypto";
import { createRequire } from "node:module";
import { test } from "node:test";
import { THEME_INIT_SCRIPT } from "./themeMode.ts";

test("the CSP allows the theme init script by its exact hash", async () => {
  const hash = `sha256-${crypto.createHash("sha256").update(THEME_INIT_SCRIPT, "utf8").digest("base64")}`;
  const nextConfig = createRequire(import.meta.url)("../../next.config.js") as {
    headers: () => Promise<
      Array<{ headers: Array<{ key: string; value: string }> }>
    >;
  };
  const csp = (await nextConfig.headers())
    .flatMap((rule) => rule.headers)
    .find((header) => header.key === "Content-Security-Policy");
  assert.ok(
    csp?.value.includes(`'${hash}'`),
    `Update THEME_SCRIPT_HASH in next.config.js to ${hash}`,
  );
});
