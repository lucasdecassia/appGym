import test from "node:test";
import assert from "node:assert/strict";
import { esc, zoneBadge, doneButton } from "./html.js";

test("esc neutraliza HTML", () => {
  assert.equal(esc('<img src=x onerror="a()">'), "&lt;img src=x onerror=&quot;a()&quot;&gt;");
  assert.equal(esc("a & b"), "a &amp; b");
  assert.equal(esc(5), "5");
});

test("zoneBadge usa a classe da zona", () => {
  assert.match(zoneBadge("Z4"), /class="zone z4"/);
});

test("doneButton alterna rótulo e classe", () => {
  assert.match(doneButton("run-x", true, "ON", "OFF"), /btn done.*ON/);
  assert.match(doneButton("run-x", false, "ON", "OFF"), /OFF/);
});
