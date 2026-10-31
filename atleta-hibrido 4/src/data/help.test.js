import test from "node:test";
import assert from "node:assert/strict";
import { RUNS } from "./plan.js";
import { FAQ_RUN, FAQ_LIFT, LIFT_PLAIN } from "./help.js";

test("perguntas frequentes têm pergunta e resposta preenchidas", () => {
  for (const [q, a] of [...FAQ_RUN, ...FAQ_LIFT]) {
    assert.ok(q.endsWith("?") && q.length > 8, q);
    assert.ok(a.length > 30, q);
  }
  assert.ok(LIFT_PLAIN.length >= 5);
});

test("o FAQ explica a notação “3 vezes de 1 km”, pace e RPE", () => {
  const all = FAQ_RUN.map(([q]) => q).join(" ");
  for (const term of ["3 vezes de 1 km", "pace", "RPE", "bpm", "Z1 a Z5"]) assert.match(all, new RegExp(term));
});

test("cada corrida tem passo a passo e as zonas citadas existem", () => {
  for (const run of Object.values(RUNS)) {
    assert.ok(run.plain.length >= 3);
    for (const p of run.plain) {
      assert.ok(p.text.length > 20);
      for (const z of p.zones) assert.match(z, /^Z[1-5]$/);
    }
  }
});

test("o passo a passo do fartlek deixa claro o par repetido", () => {
  const f = RUNS.fartlek.plain.map((p) => p.text).join(" ");
  assert.match(f, /Repita 3 vezes/);
  assert.match(f, /1 km em ritmo moderado.*3 km em ritmo forte/);
});
