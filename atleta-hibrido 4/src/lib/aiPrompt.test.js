import test from "node:test";
import assert from "node:assert/strict";
import { buildSessionPrompt, AI_LINKS } from "./aiPrompt.js";
import { RUN_KEYS, LIFT_KEYS } from "../data/plan.js";

test("pergunta de corrida traz o treino, a ordem das etapas e as regras de segurança", () => {
  const t = buildSessionPrompt("run", "fartlek");
  assert.match(t, /Fartlek 1:3/);
  assert.match(t, /Repita 3 vezes/);
  assert.match(t, /3 vezes de 1 km \(total 3 km\)/);
  assert.match(t, /Total: 12 km/);
  assert.match(t, /Z4 \(Limiar · forte\): pace 4:55–5:15 min\/km/);
  assert.match(t, /dor forte, tontura/);
  assert.match(t, /peça a minha confirmação/);
  assert.match(t, /Minha dúvida:/);
});

test("pergunta de musculação lista blocos e exercícios", () => {
  const t = buildSessionPrompt("lift", "A");
  assert.match(t, /Treino A — Peito, ombro e tríceps/);
  assert.match(t, /Bloco 3 \(Bi-set, pausa 90 seg\): Crucifixo inclinado c\/ halteres — 4 séries × 15 reps \+ Supino inclinado/);
});

test("funciona para todas as sessões do plano", () => {
  for (const k of RUN_KEYS) assert.ok(buildSessionPrompt("run", k).length > 300);
  for (const k of LIFT_KEYS) assert.ok(buildSessionPrompt("lift", k).length > 300);
});

test("não carrega dados pessoais (só o conteúdo do plano)", () => {
  for (const [kind, key] of [["run", "interval"], ["run", "fartlek"], ["lift", "B"]]) {
    assert.doesNotMatch(buildSessionPrompt(kind, key), /\b(idade|peso corporal|altura|CPF|e-?mail)\b|@|\d+\s?kg\b/i);
  }
});

test("sessão inexistente lança erro", () => {
  assert.throws(() => buildSessionPrompt("run", "nada"), /desconhecida/);
  assert.throws(() => buildSessionPrompt("swim", "x"), /desconhecida/);
});

test("links das IAs são https", () => {
  assert.ok(AI_LINKS.length >= 2);
  for (const l of AI_LINKS) assert.match(l.url, /^https:\/\//);
});
