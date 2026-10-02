import assert from "node:assert/strict";
import { test } from "node:test";
import { isExpired } from "./expiry.ts";

const now = new Date("2026-10-02T12:00:00Z");

test("a credential stays valid through the whole period its expiry names", () => {
  assert.equal(isExpired("2026", now), false);
  assert.equal(isExpired("2026-10", now), false);
  assert.equal(isExpired("2026-10-02", now), false);
  assert.equal(isExpired("Oct 2026", now), false);
  assert.equal(isExpired("October 2026", now), false);
});

test("a credential whose expiry has passed is expired, in every format", () => {
  assert.equal(isExpired("2025", now), true);
  assert.equal(isExpired("2026-09", now), true);
  assert.equal(isExpired("2026-10-01", now), true);
  assert.equal(isExpired("Sep 2026", now), true);
});

test("no expiry, or a format it cannot read, never reads as expired", () => {
  assert.equal(isExpired(null, now), false);
  assert.equal(isExpired("", now), false);
  assert.equal(isExpired("sometime", now), false);
  assert.equal(isExpired("Smarch 2020", now), false);
});
