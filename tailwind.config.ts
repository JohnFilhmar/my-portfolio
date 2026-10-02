import type { Config } from "tailwindcss";

/**
 * Tailwind is driven entirely by the design tokens in `config/theme.json`.
 *
 * Every token is mapped to a CSS custom property (emitted at runtime by
 * `<ThemeTokens>` from the same JSON), so editing `config/theme.json` and
 * refreshing restyles the whole site with no rebuild. The JSON import below
 * only supplies the token *names* at build time — the *values* come from the
 * CSS variables at runtime.
 */
import theme from "./config/theme.json";

/**
 * Tailwind uses config keys verbatim in class names (it does NOT convert
 * camelCase to kebab-case), so kebab both the class key and the CSS variable
 * name — components always use kebab-case classes like `bg-surface-alt`.
 */
const kebab = (name: string) =>
  name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

const colorVars = Object.fromEntries(
  Object.keys(theme.palettes.light).map((name) => [
    kebab(name),
    `var(--color-${kebab(name)})`,
  ]),
);

const radiusVars = Object.fromEntries(
  Object.keys(theme.radii).map((name) => [
    kebab(name),
    `var(--radius-${kebab(name)})`,
  ]),
);

const shadowVars = Object.fromEntries(
  Object.keys(theme.shadows).map((name) => [
    kebab(name),
    `var(--shadow-${kebab(name)})`,
  ]),
);

const durationVars = Object.fromEntries(
  Object.keys(theme.motion.durations).map((name) => [
    kebab(name),
    `var(--duration-${kebab(name)})`,
  ]),
);

const fontSizeVars = Object.fromEntries(
  Object.keys(theme.fontSizes).map((name) => [
    kebab(name),
    `var(--text-${kebab(name)})`,
  ]),
);

const config: Config = {
  content: ["./pages/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  // The init script in pages/_document.tsx always sets data-theme before paint.
  darkMode: ["selector", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        ...colorVars,
        // Derived accent tints, computed server-side from the accent token
        // (see src/lib/theme.ts) so components never hardcode alpha values.
        "accent-border": "var(--color-accent-border)",
        "accent-soft": "var(--color-accent-soft)",
        "accent-selected": "var(--color-accent-selected)",
        "accent-dot": "var(--color-accent-dot)",
        "accent-halo": "var(--color-accent-halo)",
        "nav-veil": "var(--color-nav-veil)",
        "launcher-veil": "var(--color-launcher-veil)",
      },
      fontFamily: {
        display: "var(--font-display)",
        mono: "var(--font-mono)",
        sans: "var(--font-sans)",
      },
      fontSize: fontSizeVars,
      borderRadius: radiusVars,
      boxShadow: shadowVars,
      transitionDuration: durationVars,
      transitionTimingFunction: { standard: "var(--easing-standard)" },
      keyframes: {
        "fade-in": { from: { opacity: "0" } },
        "panel-in": {
          from: { opacity: "0", transform: "translateY(16px) scale(0.98)" },
        },
        "row-in": { from: { opacity: "0", transform: "translateY(6px)" } },
        "rise-in": {
          from: {
            clipPath: "inset(100% 0 0 0)",
            transform: "translateY(24px)",
          },
        },
        dot: {
          "0%, 80%, 100%": { opacity: "0.25" },
          "40%": { opacity: "1" },
        },
      },
      animation: {
        "fade-in": "fade-in var(--duration-base) var(--easing-standard) both",
        "panel-in": "panel-in var(--duration-base) var(--easing-standard) both",
        "row-in": "row-in var(--duration-base) var(--easing-standard) both",
        dot: "dot 1s ease-in-out infinite",
        "rise-in":
          "rise-in var(--duration-reveal) var(--easing-reveal) 120ms both",
      },
      maxWidth: {
        container: "var(--space-container-max)",
      },
      spacing: {
        "container-pad": "var(--space-container-pad)",
        "section-y": "var(--space-section-y)",
        "hero-top": "var(--space-hero-top)",
        "hero-bottom": "var(--space-hero-bottom)",
        "contact-bottom": "var(--space-contact-bottom)",
        "column-gap": "var(--space-column-gap)",
        header: "var(--space-header-height)",
        "scroll-margin": "var(--space-scroll-margin)",
      },
    },
  },
  // Touch screens fire :hover on tap and leave it stuck; gate every hover: utility.
  future: { hoverOnlyWhenSupported: true },
  plugins: [],
};

export default config;
