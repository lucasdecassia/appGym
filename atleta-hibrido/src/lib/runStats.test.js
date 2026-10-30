import test from "node:test";
import assert from "node:assert/strict";
import { RUNS, RUN_KEYS } from "../data/plan.js";
import { stepKm, stepMinutes, runKm, runMinutes, formatKm, formatStepVolume } from "./runStats.js";

test("tiros em metros viram km (6 × 500 m = 3 km)", () => {
  assert.equal(stepKm({ reps: 6, value: 500, unit: "m" }), 3);
});

test("etapas em minutos não contam km e vice-versa", () => {
  assert.equal(stepKm({ reps: 1, value: 5, unit: "min" }), 0);
  assert.equal(stepMinutes({ reps: 6, value: 2, unit: "min" }), 12);
  assert.equal(stepMinutes({ reps: 1, value: 3, unit: "km" }), 0);
});

test("distância de cada sessão do plano", () => {
  assert.equal(runKm(RUNS.interval), 6);
  assert.equal(runKm(RUNS.steadyWed), 6);
  assert.equal(runKm(RUNS.fartlek), 12);
  assert.equal(runKm(RUNS.steadySun), 6);
});

test("total semanal de corrida = 30 km", () => {
  assert.equal(RUN_KEYS.reduce((sum, k) => sum + runKm(RUNS[k]), 0), 30);
});

test("tempo fixo das sessões", () => {
  assert.equal(runMinutes(RUNS.interval), 17);
  assert.equal(runMinutes(RUNS.steadyWed), 10);
  assert.equal(runMinutes(RUNS.fartlek), 10);
});

test("formatação", () => {
  assert.equal(formatKm(6), "6");
  assert.equal(formatKm(2.55), "2,6");
  assert.equal(formatStepVolume({ reps: 3, value: 1, unit: "km" }), "3× 1 km");
  assert.equal(formatStepVolume({ reps: 1, value: 5, unit: "min" }), "5 min");
});
