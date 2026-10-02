import localFont from "next/font/local";

/*
 * Archivo (display) and IBM Plex (body and mono), self-hosted via
 * next/font/local (files in src/fonts, OFL licensed) — no external font
 * requests at build or runtime. The generated family names are inlined into
 * the `--font-display` / `--font-sans` / `--font-mono` tokens by
 * <ThemeTokens> ahead of the stacks configured in config/theme.json.
 *
 * Swapping families = replace the files below + update theme.json's stacks.
 */

// One variable file carries both axes: weight 100-900 and width 62-125%.
const display = localFont({
  src: "../fonts/archivo-latin-wdth-normal.woff2",
  weight: "100 900",
  style: "normal",
  declarations: [{ prop: "font-stretch", value: "62% 125%" }],
  display: "swap",
});

const sans = localFont({
  src: [
    {
      path: "../fonts/ibm-plex-sans-latin-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/ibm-plex-sans-latin-500-normal.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/ibm-plex-sans-latin-600-normal.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../fonts/ibm-plex-sans-latin-700-normal.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  display: "swap",
});

const mono = localFont({
  src: [
    {
      path: "../fonts/ibm-plex-mono-latin-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/ibm-plex-mono-latin-400-italic.woff2",
      weight: "400",
      style: "italic",
    },
    {
      path: "../fonts/ibm-plex-mono-latin-500-normal.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/ibm-plex-mono-latin-600-normal.woff2",
      weight: "600",
      style: "normal",
    },
  ],
  display: "swap",
});

/** Loaded font-family lists (e.g. "'__sans_x', '__sans_Fallback_x'"). */
export const loadedFontFamilies = {
  display: display.style.fontFamily,
  sans: sans.style.fontFamily,
  mono: mono.style.fontFamily,
};
