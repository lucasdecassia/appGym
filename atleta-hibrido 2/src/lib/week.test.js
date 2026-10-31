import test from "node:test";
import assert from "node:assert/strict";
import { weekKey, mondayIndex, dateOfWeekday } from "./week.js";

test("weekKey segue a numeração ISO 8601", () => {
  assert.equal(weekKey(new Date(2026, 0, 1)), "2026-W01");
  assert.equal(weekKey(new Date(2024, 11, 30)), "2025-W01");
  assert.equal(weekKey(new Date(2021, 0, 3)), "2020-W53");
});

test("domingo e segunda ficam em semanas diferentes", () => {
  assert.notEqual(weekKey(new Date(2026, 9, 25)), weekKey(new Date(2026, 9, 26)));
  assert.equal(weekKey(new Date(2026, 9, 26)), weekKey(new Date(2026, 10, 1)));
});

test("mondayIndex: segunda = 0, domingo = 6", () => {
  assert.equal(mondayIndex(new Date(2026, 9, 26)), 0);
  assert.equal(mondayIndex(new Date(2026, 9, 30)), 4);
  assert.equal(mondayIndex(new Date(2026, 10, 1)), 6);
});

test("dateOfWeekday devolve o dia dentro da mesma semana", () => {
  const friday = new Date(2026, 9, 30);
  assert.equal(dateOfWeekday(0, friday).getDate(), 26);
  assert.equal(dateOfWeekday(6, friday).getDate(), 1);
});
