import type { CSSProperties } from "react";
import type { ColorSet, ThemeConfig } from "@config/schema";
import { kebab } from "@/lib/utils";

/**
 * Turns config/theme.json into CSS custom properties. The generated `:root`
 * block is injected server-side on every request (<ThemeTokens />), which is
 * what makes editing theme.json restyle the site on refresh with no rebuild.
 */

interface Rgb {
  r: number;
  g: number;
  b: number;
}

function hexToRgb(hex: string): Rgb | null {
  const normalized = hex.trim().replace(/^#/, "");
  const full =
    normalized.length === 3
      ? normalized
          .split("")
          .map((c) => c + c)
          .join("")
      : normalized;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

/** hex + alpha → rgba() string. Falls back to the raw value for non-hex input. */
export function rgba(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

/** Mix two hex colors (weight = share of `a`). */
export function mixHex(a: string, b: string, weight: number): string {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  if (!ca || !cb) return a;
  const mix = (x: number, y: number) =>
    Math.round(x * weight + y * (1 - weight));
  const toHex = (v: number) => v.toString(16).padStart(2, "0");
  return `#${toHex(mix(ca.r, cb.r))}${toHex(mix(ca.g, cb.g))}${toHex(mix(ca.b, cb.b))}`;
}

export interface LoadedFonts {
  display: string;
  sans: string;
  mono: string;
}

/** One palette's color custom properties, plus the tints derived from it. */
function colorVariables(scheme: "light" | "dark", colors: ColorSet): string {
  // Scrollbars and native form controls follow the palette's lightness.
  const vars = [`color-scheme: ${scheme};`];
  const add = (name: string, value: string) => vars.push(`${name}: ${value};`);
  for (const [name, value] of Object.entries(colors)) {
    add(`--color-${kebab(name)}`, value);
  }
  const { accent, dot, background, surfaceAlt } = colors;
  add("--color-accent-border", rgba(accent, 0.38));
  add("--color-accent-soft", rgba(accent, 0.07));
  add("--color-accent-selected", rgba(accent, 0.1));
  add("--color-accent-halo", rgba(accent, 0.45));
  add("--color-accent-dot", mixHex(accent, dot, 0.55));
  // Translucent veils for the sticky nav and the floating launcher.
  // (Tailwind opacity modifiers don't work on plain var() colors, so these
  // are precomputed here instead of `bg-background/85`-style classes.)
  add("--color-nav-veil", rgba(background, 0.84));
  add("--color-launcher-veil", rgba(surfaceAlt, 0.92));
  return vars.join("\n");
}

/**
 * Build the full theme CSS text from the tokens. Light colors sit on :root,
 * dark colors apply under `data-theme="dark"`, or by system preference when
 * no script set the attribute. Derived accent tints are computed here so
 * component code (and content JSON) never contains alpha math or raw colors.
 * `loadedFonts` are the next/font-generated family lists, placed ahead of the
 * configured stacks.
 */
export function buildCssVariables(
  theme: ThemeConfig,
  loadedFonts?: LoadedFonts,
): string {
  const vars: string[] = [];
  const add = (name: string, value: string) => vars.push(`${name}: ${value};`);

  // Fonts: the self-hosted (next/font) families first, then the configured
  // stacks from theme.json as fallbacks.
  add(
    "--font-display",
    loadedFonts
      ? `${loadedFonts.display}, ${theme.fonts.display}`
      : theme.fonts.display,
  );
  add(
    "--font-sans",
    loadedFonts ? `${loadedFonts.sans}, ${theme.fonts.sans}` : theme.fonts.sans,
  );
  add(
    "--font-mono",
    loadedFonts ? `${loadedFonts.mono}, ${theme.fonts.mono}` : theme.fonts.mono,
  );

  for (const [name, value] of Object.entries(theme.fontSizes)) {
    add(`--text-${kebab(name)}`, value);
  }
  for (const [name, value] of Object.entries(theme.spacing)) {
    add(`--space-${kebab(name)}`, value);
  }
  for (const [name, value] of Object.entries(theme.radii)) {
    add(`--radius-${kebab(name)}`, value);
  }
  for (const [name, value] of Object.entries(theme.shadows)) {
    add(`--shadow-${kebab(name)}`, value);
  }
  for (const [name, value] of Object.entries(theme.motion.durations)) {
    add(`--duration-${kebab(name)}`, value);
  }
  for (const [name, value] of Object.entries(theme.motion.easings)) {
    add(`--easing-${kebab(name)}`, value);
  }

  add("--texture-line", theme.terminal.textureLine);
  add("--texture-size", theme.terminal.textureSize);

  const light = colorVariables("light", theme.palettes.light);
  const dark = colorVariables("dark", theme.palettes.dark);
  return [
    `:root {\n${light}\n${vars.join("\n")}\n}`,
    `:root[data-theme="dark"] {\n${dark}\n}`,
    `@media (prefers-color-scheme: dark) {\n:root:not([data-theme]) {\n${dark}\n}\n}`,
  ].join("\n");
}

/** Fixed full-page texture overlay (grid / scanlines / none) from theme tokens. */
export function textureStyle(theme: ThemeConfig): CSSProperties | null {
  const { texture, textureLine, scanlineColor, textureSize } = theme.terminal;
  if (texture === "none") return null;
  if (texture === "scanlines") {
    return {
      backgroundImage: `repeating-linear-gradient(0deg, ${scanlineColor} 0px, ${scanlineColor} 1px, transparent 1px, transparent 3px)`,
    };
  }
  return {
    backgroundImage: `linear-gradient(${textureLine} 1px, transparent 1px), linear-gradient(90deg, ${textureLine} 1px, transparent 1px)`,
    backgroundSize: `${textureSize} ${textureSize}`,
  };
}
