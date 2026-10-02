import assert from "node:assert/strict";
import { test } from "node:test";
import {
  refundAnswer,
  remainingAnswers,
  reserveAnswer,
  visitorKey,
} from "./aiQuota.ts";

test("a visitor is IP plus user agent, and the key never contains either", () => {
  const key = visitorKey("203.0.113.7", "Mozilla/5.0");
  assert.equal(key, visitorKey("203.0.113.7", "Mozilla/5.0"));
  assert.notEqual(key, visitorKey("203.0.113.7", "curl/8.0"));
  assert.notEqual(key, visitorKey("203.0.113.8", "Mozilla/5.0"));
  assert.ok(!key.includes("203.0.113.7"));
});

test("a visitor gets exactly their daily answers, and a refund gives one back", () => {
  const key = visitorKey("198.51.100.1", "test-agent");
  const limits = { perVisitor: 5, perSite: 1_000 };
  assert.equal(remainingAnswers(key, limits), 5);
  for (let left = 4; left >= 0; left -= 1) {
    assert.equal(reserveAnswer(key, limits), left);
  }
  assert.equal(reserveAnswer(key, limits), null);
  refundAnswer(key);
  assert.equal(remainingAnswers(key, limits), 1);
});

test("the site-wide cap stops every visitor once it is spent", () => {
  const probe = { perVisitor: 1_000_000, perSite: 1_000 };
  const usedSoFar = 1_000 - remainingAnswers(visitorKey("fresh", "probe"), probe);
  const limits = { perVisitor: 5, perSite: usedSoFar + 2 };
  assert.notEqual(reserveAnswer(visitorKey("192.0.2.1", "a"), limits), null);
  assert.notEqual(reserveAnswer(visitorKey("192.0.2.2", "b"), limits), null);
  assert.equal(reserveAnswer(visitorKey("192.0.2.3", "c"), limits), null);
});
