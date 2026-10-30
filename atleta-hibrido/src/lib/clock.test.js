import test from "node:test";
import assert from "node:assert/strict";
import { formatClock } from "./clock.js";

test("formatClock", () => {
  assert.equal(formatClock(90), "1:30");
  assert.equal(formatClock(45), "0:45");
  assert.equal(formatClock(60), "1:00");
  assert.equal(formatClock(0.2), "0:01");
  assert.equal(formatClock(-5), "0:00");
});
