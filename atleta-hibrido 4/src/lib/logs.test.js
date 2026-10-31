import test from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_SCHEDULE } from "../data/plan.js";
import { validateLog, upsertLog, logsFor, plannedVsRealized } from "./logs.js";

const run = { date: "2026-10-30", kind: "run", key: "fartlek", durationMin: "75", rpe: "8", km: "12,5", cadenceAvg: "170", cadenceMax: "182", notes: " forte " };

test("validateLog aceita corrida completa", () => {
  const r = validateLog(run);
  assert.equal(r.ok, true);
  assert.deepEqual([r.value.km, r.value.rpe, r.value.cadenceAvg, r.value.notes], [12.5, 8, 170, "forte"]);
});

test("todos os campos opcionais podem ficar vazios", () => {
  const r = validateLog({ date: "2026-10-30", kind: "lift", key: "A" });
  assert.equal(r.ok, true);
  assert.equal(r.value.rpe, null);
});

test("rejeita valores fora do intervalo e cadência máxima menor que a média", () => {
  const r = validateLog({ ...run, rpe: "11", km: "0", cadenceMax: "150", durationMin: "0" });
  assert.ok(r.errors.rpe && r.errors.km && r.errors.cadenceMax && r.errors.durationMin);
  assert.ok(validateLog({ date: "2026-10-30", kind: "run", key: "nada" }).errors.key);
  assert.ok(validateLog({ ...run, kind: "swim" }).errors.kind);
});

test("força ignora distância e cadência", () => {
  const r = validateLog({ date: "2026-10-30", kind: "lift", key: "B", km: "5", cadenceAvg: "170" });
  assert.equal(r.value.km, null);
  assert.equal(r.value.cadenceAvg, null);
});

test("cadência não é imposta: sem dado fica null", () => {
  assert.equal(validateLog({ ...run, cadenceAvg: "", cadenceMax: "" }).value.cadenceAvg, null);
});

test("upsert substitui a mesma sessão no mesmo dia e preserva createdAt", () => {
  const v = validateLog(run).value;
  const a = upsertLog([], v, { id: "l1", now: "t1" });
  const b = upsertLog(a, { ...v, rpe: 6 }, { id: "outro", now: "t2" });
  assert.equal(b.length, 1);
  assert.deepEqual([b[0].id, b[0].rpe, b[0].createdAt, b[0].updatedAt], ["l1", 6, "t1", "t2"]);
  assert.equal(upsertLog(b, { ...v, date: "2026-10-31" }, { id: "l2", now: "t3" }).length, 2);
});

test("logsFor ordena do mais recente", () => {
  const logs = [{ kind: "run", key: "a", date: "2026-10-01" }, { kind: "run", key: "a", date: "2026-10-09" }, { kind: "lift", key: "a", date: "2026-10-10" }];
  assert.deepEqual(logsFor(logs, "run", "a").map((l) => l.date), ["2026-10-09", "2026-10-01"]);
});

test("planejado × realizado informa sem penalizar", () => {
  const logs = [
    { date: "2026-10-27", kind: "run", key: "interval", done: true, km: 5.5 },
    { date: "2026-10-26", kind: "lift", key: "A", done: true },
    { date: "2026-10-28", kind: "lift", key: "B", done: true }, // não planejada para quarta
  ];
  const r = plannedVsRealized(DEFAULT_SCHEDULE, logs, "2026-10-26");
  assert.equal(r.planned, 8);
  assert.equal(r.realized, 2);
  assert.equal(r.extra, 1);
  assert.equal(r.kmPlanned, 30);
  assert.equal(r.kmRealized, 5.5);
  assert.equal(r.rows[1].items[0].done, true);
  assert.equal(r.rows[3].items[0].done, false);
});
