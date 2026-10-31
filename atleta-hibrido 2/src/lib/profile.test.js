import test from "node:test";
import assert from "node:assert/strict";
import { validateProfile, validateGoals, validateBodyWeight } from "./profile.js";

test("perfil válido; altura e peso são opcionais", () => {
  const r = validateProfile({ age: "28", sex: "M", heightCm: "", weightKg: "", objective: "", restrictions: "" });
  assert.equal(r.ok, true);
  assert.equal(r.value.heightCm, null);
  assert.equal(validateProfile({ age: "28", sex: "M", heightCm: "178", weightKg: "84,5", objective: "muscle" }).value.weightKg, 84.5);
});

test("perfil inválido", () => {
  const r = validateProfile({ age: "5", sex: "x", heightCm: "50", weightKg: "1000", objective: "zzz", restrictions: "x".repeat(201) });
  for (const k of ["age", "sex", "heightCm", "weightKg", "objective", "restrictions"]) assert.ok(r.errors[k], k);
  assert.ok(validateProfile({ age: "", sex: "M" }).errors.age);
});

test("metas: vazio = sem meta; faixas sensatas", () => {
  const ok = validateGoals({ kcal: "", protein: "140", carbs: "", fat: "", waterMl: "2500" });
  assert.equal(ok.ok, true);
  assert.equal(ok.value.kcal, null);
  assert.equal(ok.value.protein, 140);
  const bad = validateGoals({ kcal: "300", protein: "9000", waterMl: "100" });
  assert.ok(bad.errors.kcal && bad.errors.protein && bad.errors.waterMl);
});

test("peso corporal", () => {
  assert.equal(validateBodyWeight({ date: "2026-10-30", kg: "83,2" }).value.kg, 83.2);
  assert.ok(validateBodyWeight({ date: "2026-10-30", kg: "" }).errors.kg);
  assert.ok(validateBodyWeight({ date: "x", kg: "80" }).errors.date);
});
