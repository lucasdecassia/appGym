import test from "node:test";
import assert from "node:assert/strict";
import { validateHydration, dayTotal, byContext, progress, totalsPerDay } from "./hydration.js";

test("valida volume inteiro entre 1 e 3000 ml", () => {
  assert.equal(validateHydration({ date: "2026-10-30", ml: "500", context: "day" }).ok, true);
  for (const ml of ["0", "3001", "250,5", "abc", ""]) assert.ok(validateHydration({ date: "2026-10-30", ml, context: "day" }).errors.ml, ml);
});

test("valida data, hora e contexto", () => {
  const r = validateHydration({ date: "x", ml: "200", context: "zz", time: "99:00" });
  assert.ok(r.errors.date && r.errors.context && r.errors.time);
});

const entries = [
  { date: "2026-10-30", ml: 500, context: "day" },
  { date: "2026-10-30", ml: 300, context: "during" },
  { date: "2026-10-29", ml: 700, context: "day" },
];

test("totais, contexto e progresso", () => {
  assert.equal(dayTotal(entries, "2026-10-30"), 800);
  assert.deepEqual(byContext(entries, "2026-10-30").map((c) => c.id), ["day", "during"]);
  assert.equal(progress(800, 2000), 40);
  assert.equal(progress(3000, 2000), 100);
  assert.equal(progress(800, null), null);
});

test("sem lançamento o dia é lacuna", () => {
  assert.deepEqual(totalsPerDay(entries, ["2026-10-28", "2026-10-29"]).map((d) => d.ml), [null, 700]);
});
