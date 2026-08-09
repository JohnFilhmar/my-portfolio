import Head from "next/head";
import type { ThemeConfig } from "@config/schema";
import { loadedFontFamilies } from "@/lib/fonts";
import { buildCssVariables } from "@/lib/theme";

/**
 * Emits config/theme.json as CSS custom properties on :root, server-rendered
 * on every request. Editing theme.json + refreshing restyles the entire site
 * — Tailwind classes reference these variables, never raw values.
 */
export function ThemeTokens({ theme }: { theme: ThemeConfig }) {
  return (
    <Head>
      <style
        // Generated exclusively from validated theme tokens (no user input).
        dangerouslySetInnerHTML={{
          __html: buildCssVariables(theme, loadedFontFamilies),
        }}
      />
    </Head>
  );
}
