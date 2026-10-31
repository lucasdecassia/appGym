import test from "node:test";
import assert from "node:assert/strict";
import { dateKey, isValidDateKey, addDays, weekStartKey, lastDays, periodDays, isValidTime, timeToMinutes, formatShortDate } from "./dates.js";

test("dateKey usa a data local", () => {
  assert.equal(dateKey(new Date(2026, 9, 30, 23, 59)), "2026-10-30");
  assert.equal(dateKey(new Date(2026, 0, 5)), "2026-01-05");
});

test("validação rejeita datas impossíveis", () => {
  assert.equal(isValidDateKey("2026-02-29"), false);
  assert.equal(isValidDateKey("2026-13-01"), false);
  assert.equal(isValidDateKey("26-1-1"), false);
  assert.equal(isValidDateKey(20261030), false);
  assert.equal(isValidDateKey("2028-02-29"), true);
});

test("addDays atravessa mês e ano", () => {
  assert.equal(addDays("2026-10-31", 1), "2026-11-01");
  assert.equal(addDays("2026-01-01", -1), "2025-12-31");
});

test("semana começa na segunda", () => {
  assert.equal(weekStartKey("2026-10-30"), "2026-10-26");
  assert.equal(weekStartKey("2026-11-01"), "2026-10-26");
  assert.equal(weekStartKey("2026-10-26"), "2026-10-26");
});

test("lastDays e periodDays", () => {
  assert.deepEqual(lastDays("2026-10-30", 3), ["2026-10-28", "2026-10-29", "2026-10-30"]);
  assert.equal(periodDays("2026-10-30", "week").length, 7);
  assert.equal(periodDays("2026-10-30", "week")[0], "2026-10-26");
  assert.equal(periodDays("2026-02-10", "month").length, 28);
  assert.deepEqual(periodDays("2026-10-30", "day"), ["2026-10-30"]);
});

test("horários", () => {
  assert.equal(isValidTime("23:59"), true);
  assert.equal(isValidTime("24:00"), false);
  assert.equal(isValidTime("7:30"), false);
  assert.equal(timeToMinutes("07:30"), 450);
  assert.equal(formatShortDate("2026-10-30"), "30/10");
});
