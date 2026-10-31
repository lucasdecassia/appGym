import test from "node:test";
import assert from "node:assert/strict";
import { LIFTS } from "../data/plan.js";
import { exerciseId, setsNeeded, nextSetCount, liftProgress, isExerciseDone } from "./exercises.js";

test("nextSetCount marca até o círculo tocado e desmarca o último", () => {
  assert.equal(nextSetCount(0, 0), 1);
  assert.equal(nextSetCount(1, 2), 3);
  assert.equal(nextSetCount(3, 2), 2);
  assert.equal(nextSetCount(1, 0), 0);
});

test("exercício sem séries precisa de 1 marcação", () => {
  assert.equal(setsNeeded({ name: "Aquecimento" }), 1);
  assert.equal(setsNeeded({ sets: 4 }), 4);
});

test("ids são únicos dentro de cada treino", () => {
  for (const [key, lift] of Object.entries(LIFTS)) {
    const ids = lift.blocks.flatMap((b) => b.exercises.map((_, i) => exerciseId(key, b, i)));
    assert.equal(new Set(ids).size, ids.length);
  }
});

test("liftProgress conta exercícios concluídos", () => {
  const week = { sets: {} };
  assert.deepEqual(liftProgress(week, "D"), { done: 0, total: 7, percent: 0 });
  const warmup = LIFTS.D.blocks[0];
  week.sets[exerciseId("D", warmup, 0)] = 1;
  assert.equal(liftProgress(week, "D").done, 1);
  const press = LIFTS.D.blocks[1];
  week.sets[exerciseId("D", press, 0)] = 3; // 3 de 4 séries: ainda não concluído
  assert.equal(liftProgress(week, "D").done, 1);
  week.sets[exerciseId("D", press, 0)] = 4;
  assert.equal(liftProgress(week, "D").done, 2);
  assert.equal(isExerciseDone(week, exerciseId("D", press, 0), press.exercises[0]), true);
});

test("totais de exercícios por treino", () => {
  const empty = { sets: {} };
  assert.equal(liftProgress(empty, "A").total, 10);
  assert.equal(liftProgress(empty, "B").total, 10);
  assert.equal(liftProgress(empty, "C").total, 9);
});

import { exerciseIndex, recordLoad, personalRecords } from "./exercises.js";

test("índice de exercícios nomeia ids", () => {
  const idx = exerciseIndex();
  assert.equal(idx.get("A2-0").name, "Supino reto c/ halteres");
  assert.equal(idx.get("A2-0").liftKey, "A");
  assert.ok(idx.size >= 30);
});

test("recordLoad guarda uma carga por exercício/dia e remove com null", () => {
  let h = recordLoad([], { date: "2026-10-30", id: "A2-0", kg: 20 });
  h = recordLoad(h, { date: "2026-10-30", id: "A2-0", kg: 22 });
  assert.equal(h.length, 1);
  assert.equal(h[0].kg, 22);
  h = recordLoad(h, { date: "2026-10-31", id: "A2-0", kg: 24 });
  assert.equal(h.length, 2);
  assert.equal(recordLoad(h, { date: "2026-10-31", id: "A2-0", kg: NaN }).length, 1);
});

test("recordes pessoais: maior carga por exercício, ordenados", () => {
  const h = [
    { date: "2026-10-01", id: "A2-0", kg: 20 }, { date: "2026-10-20", id: "A2-0", kg: 26 },
    { date: "2026-10-05", id: "B2-0", kg: 60 }, { date: "2026-10-05", id: "ZZ-9", kg: 999 },
  ];
  const prs = personalRecords(h);
  assert.deepEqual(prs.map((p) => [p.name, p.kg]), [["Terra deadlift", 60], ["Supino reto c/ halteres", 26]]);
});
