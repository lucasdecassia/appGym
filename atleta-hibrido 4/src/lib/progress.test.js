import test from "node:test";
import assert from "node:assert/strict";
import { defaultState } from "./state.js";
import { itemsOfDay, isDayDone, weekStats } from "./progress.js";

const now = new Date(2026, 9, 30);

test("itens do dia seguem o cronograma sugerido", () => {
  const s = defaultState(now);
  assert.deepEqual(itemsOfDay(s.schedule, 0), [{ type: "lift", key: "A" }]);
  assert.deepEqual(itemsOfDay(s.schedule, 2), [{ type: "run", key: "steadyWed" }, { type: "lift", key: "C" }]);
  assert.deepEqual(itemsOfDay(s.schedule, 99), []);
});

test("chaves inválidas no cronograma são ignoradas", () => {
  assert.deepEqual(itemsOfDay([{ run: "nada", lift: "Z" }], 0), []);
});

test("dia só fica concluído quando todos os itens estão feitos", () => {
  const s = defaultState(now);
  s.week.done["run-steadyWed"] = true;
  assert.equal(isDayDone(s, 2), false);
  s.week.done["lift-C"] = true;
  assert.equal(isDayDone(s, 2), true);
});

test("dia sem itens não conta como concluído", () => {
  const s = defaultState(now);
  s.schedule[3] = {};
  assert.equal(isDayDone(s, 3), false);
});

test("estatísticas da semana", () => {
  const s = defaultState(now);
  assert.deepEqual(weekStats(s), { daysPlanned: 7, daysDone: 0, kmPlanned: 30, kmDone: 0, percent: 0 });
  s.week.done["run-fartlek"] = true;
  s.week.done["lift-A"] = true;
  const stats = weekStats(s);
  assert.equal(stats.kmDone, 12);
  assert.equal(stats.daysDone, 2);
  assert.equal(stats.percent, 29);
});
