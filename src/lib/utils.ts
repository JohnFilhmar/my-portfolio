import type { Tone } from "@config/schema";

/** Join class names, skipping falsy values. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/** camelCase → kebab-case (for CSS custom property names). */
export function kebab(name: string): string {
  return name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
}

/**
 * Map config text tones to Tailwind classes bound to theme tokens.
 * Content JSON never contains raw colors — only these named tones.
 */
export const toneTextClass: Record<Tone, string> = {
  default: "text-foreground",
  bright: "text-bright",
  heading: "text-heading",
  prose: "text-prose",
  muted: "text-muted",
  subtle: "text-subtle",
  faint: "text-faint",
  dim: "text-dim",
  ghost: "text-ghost",
  accent: "text-accent",
};

/** Zero-padded 1-based index, e.g. formatIndex("P-", 0) → "P-01". */
export function formatIndex(prefix: string, index: number): string {
  return `${prefix}${String(index + 1).padStart(2, "0")}`;
}

/** True for absolute http(s) links — used to add target="_blank". */
export function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}
