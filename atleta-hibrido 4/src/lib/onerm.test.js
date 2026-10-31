import test from "node:test";
import assert from "node:assert/strict";
import { estimateOneRepMax, loadForReps, isReliable, TARGET_REPS } from "./onerm.js";

test("Epley: 20 kg × 10 reps ≈ 26,7 kg", () => {
  assert.equal(estimateOneRepMax(20, 10), 26.7);
});

test("entrada inválida devolve null", () => {
  assert.equal(estimateOneRepMax(0, 10), null);
  assert.equal(estimateOneRepMax(20, 0), null);
  assert.equal(estimateOneRepMax(NaN, 5), null);
});

test("carga para as repetições-alvo diminui conforme as reps aumentam", () => {
  const rm = 60;
  const loads = TARGET_REPS.map((r) => loadForReps(rm, r));
  for (let i = 1; i < loads.length; i++) assert.ok(loads[i] < loads[i - 1]);
  assert.equal(loadForReps(rm, 10), 45);
});

test("confiabilidade", () => {
  assert.equal(isReliable(10), true);
  assert.equal(isReliable(20), false);
  assert.equal(isReliable(2), false);
});
