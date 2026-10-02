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

/** True for absolute http(s) links — used to add target="_blank". */
export function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

/**
 * Values found in at least `min` of the lists, in first-seen order. Filter
 * chips use it: an option that matches a single entry filters to one card.
 *
 * @param lists - One list per entry, e.g. each credential's skills.
 * @param min - How many entries must share a value. Defaults to 2.
 * @returns The shared values; empty when nothing repeats.
 */
export function sharedValues(lists: string[][], min = 2): string[] {
  const counts = new Map<string, number>();
  for (const list of lists) {
    for (const value of new Set(list)) {
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
  }
  return [...counts].filter(([, n]) => n >= min).map(([value]) => value);
}
