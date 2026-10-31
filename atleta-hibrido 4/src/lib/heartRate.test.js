import test from "node:test";
import assert from "node:assert/strict";
import { maxHeartRate, zoneRange, zoneLabel } from "./heartRate.js";

test("Tanaka para 28 anos = 188 bpm", () => {
  assert.equal(maxHeartRate({ age: 28, formula: "tanaka" }), 188);
});

test("Haskell e Fox para 28 anos = 192 bpm", () => {
  assert.equal(maxHeartRate({ age: 28, formula: "haskell" }), 192);
});

test("FCmáx medida substitui a fórmula", () => {
  assert.equal(maxHeartRate({ age: 28, formula: "tanaka", measured: 190 }), 190);
});

test("sem idade usa o padrão de 28 anos", () => {
  assert.equal(maxHeartRate({}), 188);
});

test("faixas das zonas arredondadas", () => {
  assert.deepEqual(zoneRange(188, "Z2"), { min: 113, max: 132 });
  assert.deepEqual(zoneRange(188, "Z5"), { min: 179, max: 188 });
  assert.equal(zoneLabel({ age: 28, formula: "tanaka" }, "Z3"), "132–160 bpm");
});

test("zona inexistente lança erro", () => {
  assert.throws(() => zoneRange(188, "Z9"));
});

import { zoneCalibration } from "./heartRate.js";

test("sem FCmáx medida as zonas são marcadas como não calibradas", () => {
  const c = zoneCalibration({ age: 28, formula: "tanaka" });
  assert.equal(c.calibrated, false);
  assert.match(c.method, /Tanaka/);
  assert.match(zoneCalibration({ formula: "haskell" }).method, /Haskell/);
});

test("com FCmáx medida ficam calibradas", () => {
  assert.equal(zoneCalibration({ measured: 190 }).calibrated, true);
});
