import test from "node:test";
import assert from "node:assert/strict";
import { defaultState, normalizeState } from "./state.js";

const friday = new Date(2026, 9, 30);
const nextMonday = new Date(2026, 10, 2);

test("lixo vira estado padrão", () => {
  for (const junk of [null, undefined, 42, "x", [], {}]) {
    const s = normalizeState(junk, friday);
    assert.equal(s.profile.age, 28);
    assert.equal(s.schedule.length, 7);
  }
});

test("progresso da mesma semana é mantido", () => {
  const saved = defaultState(friday);
  saved.week.done["lift-A"] = true;
  saved.week.sets["A2-0"] = 3;
  saved.loads["A2-0"] = 22.5;
  const s = normalizeState(JSON.parse(JSON.stringify(saved)), friday);
  assert.equal(s.week.done["lift-A"], true);
  assert.equal(s.week.sets["A2-0"], 3);
});

test("semana nova zera progresso mas mantém cargas e perfil", () => {
  const saved = defaultState(friday);
  saved.week.done["lift-A"] = true;
  saved.loads["A2-0"] = 22.5;
  saved.profile.age = 30;
  const s = normalizeState(saved, nextMonday);
  assert.deepEqual(s.week.done, {});
  assert.equal(s.loads["A2-0"], 22.5);
  assert.equal(s.profile.age, 30);
  assert.notEqual(s.week.key, saved.week.key);
});

test("cronograma inválido volta ao padrão", () => {
  const s = normalizeState({ schedule: [{}, {}] }, friday);
  assert.equal(s.schedule.length, 7);
});
