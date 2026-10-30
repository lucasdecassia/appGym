// Teste de fumaça: cada tela renderiza com o estado padrão e com progresso, sem lançar erro.
import test from "node:test";
import assert from "node:assert/strict";
import { defaultState } from "../lib/state.js";
import { homeView } from "./home.js";
import { runView } from "./run.js";
import { liftView } from "./lift.js";
import { toolsView, oneRepMaxResult } from "./tools.js";
import { LIFT_KEYS, RUN_KEYS } from "../data/plan.js";

const now = new Date(2026, 9, 30); // sexta (fartlek)
const state = () => defaultState(now);

test("Home mostra o treino do dia selecionado", () => {
  const html = homeView(state(), { selectedDay: 4 }, now);
  assert.match(html, /Fartlek 1:3/);
  assert.match(html, /sexta|Sexta/);
  assert.match(html, /0%/);
});

test("Home de um dia livre mostra descanso", () => {
  const s = state();
  s.schedule[3] = {};
  assert.match(homeView(s, { selectedDay: 3 }, now), /Dia de descanso/);
});

test("Home reflete progresso concluído", () => {
  const s = state();
  s.week.done["run-fartlek"] = true;
  const html = homeView(s, { selectedDay: 4 }, now);
  assert.match(html, /✓ Concluída/);
  assert.match(html, /12 \/ 30 km/);
});

test("Corrida lista as 4 sessões com bpm", () => {
  const html = runView(state(), { openRun: null });
  for (const key of RUN_KEYS) assert.ok(html.includes(`id="run-${key}"`));
  assert.match(html, /188 bpm/);
  assert.match(html, /179–188 bpm/);
});

test("Treinos A–D renderizam todos os blocos", () => {
  for (const lift of LIFT_KEYS) {
    const html = liftView(state(), { lift });
    assert.match(html, /BLOCO 01/);
    assert.match(html, new RegExp(`Treino ${lift}`));
  }
});

test("Série marcada e carga aparecem no Treino A", () => {
  const s = state();
  s.week.sets["A2-0"] = 2;
  s.loads["A2-0"] = 22.5;
  const html = liftView(s, { lift: "A" });
  assert.match(html, /chip on" data-act="set" data-id="A2-0" data-i="1"/);
  assert.match(html, /value="22.5" data-load="A2-0"/);
});

test("Ferramentas renderiza e a calculadora de 1RM responde", () => {
  assert.match(toolsView(state()), /FCmáx e zonas/);
  assert.match(oneRepMaxResult(20, 10), /26.7 kg/);
  assert.match(oneRepMaxResult(NaN, NaN), /Informe carga/);
});

test("Perfil alterado muda a FC nas telas", () => {
  const s = state();
  s.profile.measured = 200;
  assert.match(runView(s, {}), /200 bpm/);
});
