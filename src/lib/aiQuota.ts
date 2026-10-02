import { createHash } from "crypto";

/**
 * Daily budget for real model answers, per visitor and for the whole site.
 *
 * A visitor is the hash of IP + user agent: neither alone holds up (a user
 * agent is one header to change, and many visitors share an office IP), and
 * hashing keeps raw IPs out of memory. Every entry expires 24 hours after it
 * was opened.
 */

// ponytail: state is per server process. One container serves this site; put
// the counters in Redis if it ever runs more than one replica.
const WINDOW_MS = 24 * 60 * 60 * 1000;
const MAX_TRACKED_VISITORS = 20_000;

interface Window {
  used: number;
  resetAt: number;
}

const visitors = new Map<string, Window>();
let site: Window = { used: 0, resetAt: Date.now() + WINDOW_MS };

function current(entry: Window | undefined, now: number): Window {
  return entry && entry.resetAt > now
    ? entry
    : { used: 0, resetAt: now + WINDOW_MS };
}

function prune(now: number): void {
  if (visitors.size < MAX_TRACKED_VISITORS) return;
  for (const [key, entry] of visitors) {
    if (entry.resetAt <= now) visitors.delete(key);
  }
}

/**
 * Stable, non-reversible id for one visitor.
 *
 * @param ip - Client IP as resolved by `getClientIp`.
 * @param userAgent - Raw User-Agent header; missing counts as empty.
 * @returns A 32-character hex key.
 */
export function visitorKey(ip: string, userAgent: string | undefined): string {
  return createHash("sha256")
    .update(`${ip}|${userAgent ?? ""}`)
    .digest("hex")
    .slice(0, 32);
}

/**
 * Model answers this visitor can still get today.
 *
 * @param key - From `visitorKey`.
 * @param limits.perVisitor - Daily answers per visitor.
 * @param limits.perSite - Daily answers across all visitors.
 * @returns Remaining answers, 0 when either budget is spent.
 */
export function remainingAnswers(
  key: string,
  limits: { perVisitor: number; perSite: number },
): number {
  const now = Date.now();
  site = current(site, now);
  const visitor = current(visitors.get(key), now);
  return Math.max(
    0,
    Math.min(limits.perVisitor - visitor.used, limits.perSite - site.used),
  );
}

/**
 * Claim one model answer before calling the model.
 *
 * @param key - From `visitorKey`.
 * @param limits - Same limits passed to `remainingAnswers`.
 * @returns Remaining answers after the claim, or null when nothing was claimed.
 */
export function reserveAnswer(
  key: string,
  limits: { perVisitor: number; perSite: number },
): number | null {
  if (remainingAnswers(key, limits) <= 0) return null;
  const now = Date.now();
  prune(now);
  const visitor = current(visitors.get(key), now);
  visitor.used += 1;
  site.used += 1;
  visitors.set(key, visitor);
  return remainingAnswers(key, limits);
}

/**
 * Give back a claimed answer when the model call failed before producing any
 * output, so a provider outage never spends a visitor's budget.
 *
 * @param key - The key passed to `reserveAnswer`.
 */
export function refundAnswer(key: string): void {
  const visitor = visitors.get(key);
  if (visitor && visitor.used > 0) visitor.used -= 1;
  if (site.used > 0) site.used -= 1;
}
