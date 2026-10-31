import test from "node:test";
import assert from "node:assert/strict";
import { defaultState } from "./state.js";
import { buildDashboard } from "./dashboard.js";

const today = "2026-10-30";
const state = () => defaultState(new Date(2026, 9, 30));

test("estado vazio não inventa dados: tudo é lacuna", () => {
  const d = buildDashboard(state(), today);
  assert.equal(d.weeks.length, 8);
  assert.ok(d.weeks.every((w) => w.runKm === null && w.load === null && w.lifts === null));
  assert.ok(d.hydration.every((v) => v === null));
  assert.ok(d.sleep.every((v) => v === null));
  assert.deepEqual(d.records, []);
  assert.equal(d.milestones.totalRunKm, null);
  assert.equal(d.planVsReal.realized, 0);
});

test("semana corrente agrega corrida, força e carga interna", () => {
  const s = state();
  s.logs = [
    { id: "1", date: "2026-10-27", kind: "run", key: "interval", done: true, km: 5.5, durationMin: 50, rpe: 8 },
    { id: "2", date: "2026-10-26", kind: "lift", key: "A", done: true, durationMin: 60, rpe: 7 },
    { id: "3", date: "2026-10-19", kind: "run", key: "fartlek", done: true, km: 11, durationMin: 70, rpe: 7 },
  ];
  const d = buildDashboard(s, today);
  const cur = d.weeks[7];
  assert.deepEqual([cur.runKm, cur.runMin, cur.lifts, cur.load, cur.sessions], [5.5, 50, 1, 820, 2]);
  assert.equal(d.weeks[6].runKm, 11);
  assert.equal(d.weeks[5].runKm, null);
  assert.equal(d.milestones.totalRunKm, 16.5);
  assert.equal(d.milestones.longestRunKm, 11);
  assert.equal(d.rpe.length, 3);
});

test("sono, hidratação e nutrição dos últimos 7 dias, com lacunas", () => {
  const s = state();
  s.sleep = [{ id: "s", date: "2026-10-30", minutes: 450, bed: "23:00" }];
  s.hydration.entries = [{ id: "h", date: "2026-10-29", ml: 600, context: "day" }];
  s.nutrition.entries = [{ id: "n", date: "2026-10-30", meal: "lunch", name: "x", kcal: 500, protein: 30, estimated: true }];
  const d = buildDashboard(s, today);
  assert.equal(d.sleep[6], 7.5);
  assert.equal(d.sleep[5], null);
  assert.equal(d.hydration[5], 600);
  assert.equal(d.hydration[6], null);
  assert.deepEqual([d.kcal[6], d.protein[6], d.kcal[0]], [500, 30, null]);
});

test("recordes e peso corporal", () => {
  const s = state();
  s.loadHistory = [{ date: "2026-10-20", id: "A2-0", kg: 26 }];
  s.body = [{ id: "b1", date: "2026-10-01", kg: 84 }, { id: "b2", date: "2026-10-29", kg: 83.4 }];
  const d = buildDashboard(s, today);
  assert.equal(d.records[0].name, "Supino reto c/ halteres");
  assert.deepEqual(d.body.map((p) => p.value), [84, 83.4]);
});
