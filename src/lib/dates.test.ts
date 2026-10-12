import assert from "node:assert/strict";
import { test } from "node:test";
import { durationBetween, monthIndex } from "./dates.ts";

test("reads every date shape the config allows", () => {
  assert.equal(monthIndex("2025-03"), monthIndex("Mar 2025"));
  assert.equal(monthIndex("March 2025"), monthIndex("2025-03-14"));
  assert.equal(monthIndex("2025"), monthIndex("Jan 2025"));
  assert.equal(monthIndex("soon"), null);
});

test("describes the time from first code to production", () => {
  assert.equal(durationBetween("Mar 2025", "Nov 2025"), "8 months");
  assert.equal(durationBetween("Jan 2024", "Jan 2025"), "1 year");
  assert.equal(durationBetween("Jan 2024", "Mar 2025"), "1 year 2 months");
  assert.equal(durationBetween("2025-06", "Jun 2025"), "under a month");
  assert.equal(durationBetween("Nov 2025", "Mar 2025"), null);
  assert.equal(durationBetween("tbd", "Mar 2025"), null);
});
