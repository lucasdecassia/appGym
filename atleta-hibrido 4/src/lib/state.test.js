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

import { needsMigration, STATE_VERSION } from "./state.js";

const v1 = () => {
  const s = defaultState(friday);
  s.version = 1;
  delete s.logs; delete s.nutrition; delete s.hydration; delete s.sleep; delete s.body; delete s.loadHistory;
  s.loads["A2-0"] = 22.5;
  s.profile = { age: 30, formula: "haskell", measured: 190 };
  return s;
};

test("migração v1 → v2 preserva dados antigos e cria coleções novas", () => {
  const old = v1();
  assert.equal(needsMigration(old), true);
  const s = normalizeState(old, friday);
  assert.equal(s.version, STATE_VERSION);
  assert.equal(s.loads["A2-0"], 22.5);
  assert.equal(s.profile.age, 30);
  assert.equal(s.profile.measured, 190);
  assert.equal(s.profile.sex, "M");
  assert.deepEqual([s.logs, s.sleep, s.body, s.hydration.entries, s.nutrition.entries], [[], [], [], [], []]);
  assert.equal(needsMigration(s), false);
});

test("entradas inválidas nas coleções são descartadas sem perder as válidas", () => {
  const s = normalizeState({
    sleep: [{ id: "a", date: "2026-10-30", minutes: 400 }, { id: "b", date: "lixo", minutes: 400 }, { date: "2026-10-30", minutes: 1 }, null],
    hydration: { goalMl: "2500", entries: [{ id: "h", date: "2026-10-30", ml: 300 }, { id: "x", date: "2026-10-30", ml: "abc" }] },
    logs: [{ id: "l", date: "2026-10-30", kind: "swim" }, { id: "m", date: "2026-10-30", kind: "run", key: "fartlek" }],
  }, friday);
  assert.equal(s.sleep.length, 1);
  assert.equal(s.hydration.entries.length, 1);
  assert.equal(s.hydration.goalMl, 2500);
  assert.equal(s.logs.length, 1);
});

test("dados pessoais não vêm preenchidos no código", () => {
  const p = defaultState(friday).profile;
  assert.equal(p.heightCm, null);
  assert.equal(p.weightKg, null);
});

test("ida e volta por JSON mantém o estado", () => {
  const s = defaultState(friday);
  s.hydration.entries.push({ id: "h1", date: "2026-10-30", ml: 500, context: "day", time: "" });
  assert.deepEqual(normalizeState(JSON.parse(JSON.stringify(s)), friday), s);
});
