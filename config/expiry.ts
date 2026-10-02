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

/** First instant after the period a free-form date names, or null if unreadable. */
function endOf(text: string): Date | null {
  const t = text.trim().toLowerCase();
  let m = /^(\d{4})$/.exec(t);
  if (m) return new Date(Date.UTC(Number(m[1]) + 1, 0, 1));
  m = /^(\d{4})-(\d{2})$/.exec(t);
  if (m) return new Date(Date.UTC(Number(m[1]), Number(m[2]), 1));
  m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(t);
  if (m)
    return new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]) + 1));
  m = /^([a-z]{3})[a-z]*\.?\s+(\d{4})$/.exec(t);
  const month = m ? MONTHS.indexOf(m[1] ?? "") : -1;
  if (m && month >= 0) return new Date(Date.UTC(Number(m[2]), month + 1, 1));
  return null;
}

/**
 * Whether a credential's `expires` date has passed. Reads "2027",
 * "2027-03", "2027-03-31" and "Mar 2027"; the whole named period counts as
 * still valid.
 *
 * @param expires - The config value. null means the credential never expires.
 * @param now - The moment to compare against.
 * @returns False for null or for a date it cannot read, so an unusual format
 *   never marks a valid credential as expired.
 */
export function isExpired(expires: string | null, now: Date): boolean {
  if (!expires) return false;
  const end = endOf(expires);
  return end !== null && end.getTime() <= now.getTime();
}
