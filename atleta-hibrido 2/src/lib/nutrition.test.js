import test from "node:test";
import assert from "node:assert/strict";
import { validateFood, dayTotals, entriesByMeal, totalsPerDay, goalProgress, mifflinStJeor, bmi, proteinRange, kcalGoalWarning, parseNumber, favoriteFromEntry, isSameFavorite } from "./nutrition.js";

const ok = { date: "2026-10-30", time: "12:30", meal: "lunch", name: " Arroz ", qty: "150", unit: "g", kcal: "195", protein: "4,2", carbs: "42", fat: "", estimated: true };

test("validateFood normaliza entrada válida (vírgula decimal, campos vazios = null)", () => {
  const r = validateFood(ok);
  assert.equal(r.ok, true);
  assert.equal(r.value.name, "Arroz");
  assert.equal(r.value.protein, 4.2);
  assert.equal(r.value.fat, null);
  assert.equal(r.value.estimated, true);
});

test("validateFood aponta cada erro", () => {
  const r = validateFood({ ...ok, name: "", qty: "0", kcal: "-1", unit: "xx", date: "2026-02-30", time: "25:00", meal: "x" });
  assert.equal(r.ok, false);
  for (const k of ["name", "qty", "kcal", "unit", "date", "time", "meal"]) assert.ok(r.errors[k], k);
});

test("texto não numérico é rejeitado", () => {
  assert.ok(validateFood({ ...ok, kcal: "abc" }).errors.kcal);
  assert.ok(Number.isNaN(parseNumber("abc")));
  assert.equal(parseNumber(""), null);
});

const entries = [
  { id: "1", date: "2026-10-30", meal: "lunch", time: "12:30", name: "A", kcal: 500, protein: 30, carbs: 50, fat: 10, estimated: true },
  { id: "2", date: "2026-10-30", meal: "breakfast", time: "07:00", name: "B", kcal: 300, protein: 20.5, carbs: 30, fat: 5, estimated: false },
  { id: "3", date: "2026-10-29", meal: "dinner", name: "C", kcal: 700, protein: 40, carbs: 60, fat: 20, estimated: true },
];

test("somas do dia", () => {
  assert.deepEqual(dayTotals(entries, "2026-10-30"), { count: 2, estimatedCount: 1, kcal: 800, protein: 50.5, carbs: 80, fat: 15, fiber: 0 });
});

test("refeições agrupadas na ordem do dia", () => {
  assert.deepEqual(entriesByMeal(entries, "2026-10-30").map((g) => g.id), ["breakfast", "lunch"]);
});

test("dias sem registro são lacuna, não zero", () => {
  const rows = totalsPerDay(entries, ["2026-10-28", "2026-10-29"]);
  assert.equal(rows[0].hasData, false);
  assert.equal(rows[1].kcal, 700);
});

test("progresso de metas", () => {
  const p = goalProgress(dayTotals(entries, "2026-10-30"), { protein: 100, kcal: null });
  assert.equal(p.find((x) => x.key === "protein").percent, 51);
  assert.equal(p.find((x) => x.key === "kcal").percent, null);
});

test("Mifflin–St Jeor: 84 kg, 178 cm, 28 anos, masculino = 1818 kcal (1817,5)", () => {
  assert.equal(mifflinStJeor({ sex: "M", weightKg: 84, heightCm: 178, age: 28 }), 1818);
  assert.equal(mifflinStJeor({ sex: "F", weightKg: 60, heightCm: 165, age: 30 }), 1320);
  assert.equal(mifflinStJeor({ sex: "M", weightKg: 0, heightCm: 178, age: 28 }), null);
});

test("IMC e faixa de proteína de referência", () => {
  assert.equal(bmi(84, 178), 26.5);
  assert.deepEqual(proteinRange(84), { min: 118, max: 168 });
  assert.equal(proteinRange(null), null);
});

test("aviso para meta abaixo do metabolismo basal", () => {
  assert.match(kcalGoalWarning(1500, 1818), /nutricionista/);
  assert.equal(kcalGoalWarning(2200, 1818), null);
  assert.equal(kcalGoalWarning(null, 1818), null);
});

test("favoritos", () => {
  const f = favoriteFromEntry(entries[0]);
  assert.equal(f.name, "A");
  assert.equal(isSameFavorite(f, { ...f, name: "a" }), true);
  assert.equal(isSameFavorite(f, { ...f, qty: 2 }), false);
});
