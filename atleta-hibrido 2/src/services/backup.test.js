import test from "node:test";
import assert from "node:assert/strict";
import { buildBackup, parseBackup } from "./backup.js";
import { defaultState } from "../lib/state.js";

const now = new Date(2026, 9, 30, 12);

test("ida e volta preserva as cargas", () => {
  const s = defaultState(now);
  s.loads["A2-0"] = 24;
  const { filename, json } = buildBackup(s, now);
  assert.match(filename, /^atleta-hibrido-backup-\d{4}-\d{2}-\d{2}\.json$/);
  assert.equal(parseBackup(json, now).loads["A2-0"], 24);
});

test("rejeita arquivos que não são do app", () => {
  assert.throws(() => parseBackup("não é json"), /JSON válido/);
  assert.throws(() => parseBackup(JSON.stringify({ app: "outro", state: {} })), /não é um backup/);
  assert.throws(() => parseBackup("null"), /não é um backup/);
});
