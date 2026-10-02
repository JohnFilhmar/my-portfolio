import assert from "node:assert/strict";
import { test } from "node:test";
import { sharedValues } from "./utils.ts";

test("only values shared by enough entries become filter options", () => {
  const skills = [
    ["AWS", "Networking", "Networking"],
    ["Kubernetes"],
    ["Security", "Networking"],
    ["Security"],
  ];
  assert.deepEqual(sharedValues(skills), ["Networking", "Security"]);
  assert.deepEqual(sharedValues(skills, 3), []);
  assert.deepEqual(sharedValues([]), []);
});
