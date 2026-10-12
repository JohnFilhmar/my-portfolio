const MONTHS = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
];

/**
 * Reads a free-form month from config: "2025", "2025-03", "2025-03-14",
 * "Mar 2025" or "March 2025". A bare year counts as its January.
 *
 * @param text - The config value.
 * @returns Months since year 0, or null when the text is not a date.
 */
export function monthIndex(text: string): number | null {
  const t = text.trim().toLowerCase();
  let m = /^(\d{4})(?:-(\d{2}))?(?:-\d{2})?$/.exec(t);
  if (m) return Number(m[1]) * 12 + (m[2] ? Number(m[2]) - 1 : 0);
  m = /^([a-z]{3})[a-z]*\.?\s+(\d{4})$/.exec(t);
  const month = m ? MONTHS.indexOf(m[1] ?? "") : -1;
  return m && month >= 0 ? Number(m[2]) * 12 + month : null;
}

/**
 * How long from one free-form month to another, in words.
 *
 * @param from - Earlier date, e.g. "Mar 2025".
 * @param to - Later date, e.g. "Nov 2025".
 * @returns "8 months", "1 year 2 months", "under a month", or null when
 *   either date is unreadable or `to` is earlier than `from`.
 */
export function durationBetween(from: string, to: string): string | null {
  const a = monthIndex(from);
  const b = monthIndex(to);
  if (a === null || b === null || b < a) return null;
  const months = b - a;
  if (months === 0) return "under a month";
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const part = (n: number, unit: string) => `${n} ${unit}${n === 1 ? "" : "s"}`;
  if (years === 0) return part(rest, "month");
  return rest === 0
    ? part(years, "year")
    : `${part(years, "year")} ${part(rest, "month")}`;
}
