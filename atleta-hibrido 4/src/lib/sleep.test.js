import test from "node:test";
import assert from "node:assert/strict";
import { sleepMinutes, formatDuration, validateSleep, weekSummary, perNight, REFERENCE_MINUTES } from "./sleep.js";

test("duração atravessa a meia-noite", () => {
  assert.equal(sleepMinutes("23:00", "07:00"), 480);
  assert.equal(sleepMinutes("00:30", "07:30"), 420);
  assert.equal(sleepMinutes("22:15", "22:16"), 1);
});

test("horários iguais ou inválidos não geram duração", () => {
  assert.equal(sleepMinutes("07:00", "07:00"), null);
  assert.equal(sleepMinutes("7:00", "08:00"), null);
});

test("formatDuration", () => {
  assert.equal(formatDuration(450), "7 h 30");
  assert.equal(formatDuration(420), "7 h");
  assert.equal(formatDuration(null), "—");
});

const base = { date: "2026-10-30", bed: "23:00", wake: "06:30", quality: "4", feeling: "3", fatigue: "2", soreness: "", restDay: false, notes: " ok " };

test("validateSleep aceita e calcula minutos", () => {
  const r = validateSleep(base);
  assert.equal(r.ok, true);
  assert.equal(r.value.minutes, 450);
  assert.equal(r.value.soreness, null);
  assert.equal(r.value.notes, "ok");
});

test("validateSleep rejeita escalas fora de 1–5 e qualidade ausente", () => {
  const r = validateSleep({ ...base, quality: "", fatigue: "9", feeling: "2,5" });
  assert.ok(r.errors.quality && r.errors.fatigue && r.errors.feeling);
  assert.ok(validateSleep({ ...base, wake: "23:00" }).errors.wake);
  assert.ok(validateSleep({ ...base, notes: "x".repeat(301) }).errors.notes);
});

test("resumo semanal: média, regularidade e referência de 7 h", () => {
  const entries = [
    { date: "2026-10-26", bed: "23:00", minutes: 480, quality: 4, restDay: false },
    { date: "2026-10-27", bed: "23:30", minutes: 360, quality: 3, restDay: true },
    { date: "2026-10-28", bed: "00:00", minutes: 420, quality: 5, restDay: false },
  ];
  const s = weekSummary(entries, ["2026-10-26", "2026-10-27", "2026-10-28", "2026-10-29"]);
  assert.equal(s.nights, 3);
  assert.equal(s.avgMinutes, 420);
  assert.equal(s.belowReference, false);
  assert.equal(s.restDays, 1);
  assert.equal(s.regularityMinutes, 24); // horários 23:00, 23:30 e 00:00: desvio-padrão populacional = raiz de 600
  assert.equal(weekSummary(entries.slice(0, 1), ["2026-10-26"]).regularityMinutes, null);
  assert.equal(weekSummary(entries.slice(0, 2), ["2026-10-26", "2026-10-27"]).avgMinutes, 420);
  assert.ok(REFERENCE_MINUTES === 420);
});

test("média abaixo de 7 h é sinalizada", () => {
  const s = weekSummary([{ date: "2026-10-26", bed: "01:00", minutes: 360, quality: 3 }], ["2026-10-26"]);
  assert.equal(s.belowReference, true);
});

test("noites sem registro viram lacuna", () => {
  assert.deepEqual(perNight([{ date: "2026-10-26", minutes: 400, fatigue: 2 }], ["2026-10-26", "2026-10-27"]).map((n) => n.minutes), [400, null]);
});
