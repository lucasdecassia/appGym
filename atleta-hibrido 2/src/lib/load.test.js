import test from "node:test";
import assert from "node:assert/strict";
import { sessionLoad, weeklyLoad, changePercent, descriptiveAlerts } from "./load.js";

test("carga da sessão = duração × RPE", () => {
  assert.equal(sessionLoad(60, 7), 420);
  assert.equal(sessionLoad(60, null), null);
  assert.equal(sessionLoad(0, 7), null);
});

test("carga semanal só conta sessões concluídas da semana, com dados completos", () => {
  const logs = [
    { date: "2026-10-26", done: true, durationMin: 60, rpe: 7 },
    { date: "2026-10-27", done: true, durationMin: 40, rpe: null },
    { date: "2026-10-28", done: false, durationMin: 50, rpe: 6 },
    { date: "2026-11-02", done: true, durationMin: 50, rpe: 6 },
  ];
  assert.equal(weeklyLoad(logs, ["2026-10-26", "2026-10-27", "2026-10-28"]), 420);
});

test("variação percentual", () => {
  assert.equal(changePercent(1000, 1300), 30);
  assert.equal(changePercent(0, 500), null);
  assert.equal(changePercent(1000, 800), -20);
});

test("alertas descritivos", () => {
  assert.equal(descriptiveAlerts({ thisWeekLoad: 1000, lastWeekLoad: 900, avgSleepMinutes: 450 }).length, 0);
  const a = descriptiveAlerts({ thisWeekLoad: 1400, lastWeekLoad: 1000, avgSleepMinutes: 380 });
  assert.equal(a.length, 2);
  assert.match(a[0], /40%/);
  assert.match(a[1], /7 h/);
});
