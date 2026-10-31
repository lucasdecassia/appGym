import test from "node:test";
import assert from "node:assert/strict";
import { buildCsv, CSV_KINDS } from "./exports.js";
import { defaultState } from "../lib/state.js";

const now = new Date(2026, 9, 30, 12);
const state = () => {
  const s = defaultState(now);
  s.nutrition.entries = [{ id: "n1", date: "2026-10-30", time: "12:00", meal: "lunch", name: "Arroz, feijão", qty: 200, unit: "g", kcal: 300, protein: 12, carbs: 50, fat: 4, fiber: null, estimated: true }];
  s.hydration.entries = [{ id: "h1", date: "2026-10-30", time: "", context: "during", ml: 500 }];
  s.sleep = [{ id: "s1", date: "2026-10-30", bed: "23:00", wake: "06:30", minutes: 450, quality: 4, feeling: null, fatigue: 2, soreness: null, restDay: false, notes: "=cmd" }];
  s.logs = [{ id: "l1", date: "2026-10-30", kind: "run", key: "fartlek", done: true, durationMin: 70, km: 12, rpe: 8, cadenceAvg: 172, cadenceMax: null, notes: "" }];
  return s;
};

test("cada exportação gera cabeçalho em português e nome com data", () => {
  for (const kind of CSV_KINDS) {
    const { filename, text } = buildCsv(kind, state(), now);
    assert.match(filename, new RegExp(`^atleta-hibrido-${kind}-2026-10-30\\.csv$`));
    assert.ok(text.startsWith("\uFEFF"));
  }
});

test("nutrição: rótulos legíveis, vírgulas escapadas e estimativa marcada", () => {
  const { text } = buildCsv("nutrition", state(), now);
  assert.match(text, /Almoço,"Arroz, feijão",200,g,300,12,50,4,,sim/);
});

test("treino: nome da sessão e dados de corrida", () => {
  const { text } = buildCsv("training", state(), now);
  assert.match(text, /corrida,Fartlek 1:3,70,12,8,172/);
});

test("campos de texto não executam fórmulas ao abrir em planilha", () => {
  assert.match(buildCsv("sleep", state(), now).text, /'=cmd/);
});

test("tipo desconhecido lança erro", () => {
  assert.throws(() => buildCsv("xyz", state()), /desconhecida/);
});

test("estado vazio gera só o cabeçalho", () => {
  assert.equal(buildCsv("sleep", defaultState(now), now).text.trim().split("\r\n").length, 1);
});
