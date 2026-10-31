import test from "node:test";
import assert from "node:assert/strict";
import { newId } from "./ids.js";

test("ids têm prefixo e variam", () => {
  const a = newId("food", 1000, () => 0.1);
  const b = newId("food", 1000, () => 0.2);
  assert.match(a, /^food_/);
  assert.notEqual(a, b);
});
