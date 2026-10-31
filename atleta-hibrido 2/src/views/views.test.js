// Testes de fumaça: cada tela renderiza (estado vazio e com dados) sem lançar erro e com o conteúdo essencial.
import test from "node:test";
import assert from "node:assert/strict";
import { defaultState } from "../lib/state.js";
import { homeView } from "./home.js";
import { trainView, runSection } from "./train.js";
import { nutritionView } from "./nutrition.js";
import { recoveryView } from "./recovery.js";
import { dashboardView } from "./dashboard.js";
import { toolsView, oneRepMaxResult } from "./tools.js";
import { LIFT_KEYS, RUN_KEYS } from "../data/plan.js";

const now = new Date(2026, 9, 30); // sexta (fartlek)
const today = "2026-10-30";
const state = () => defaultState(now);
const baseUi = () => ({ tab: "home", selectedDay: 4, trainSeg: "run", lift: "A", openRun: null, nutriSeg: "diary", nutriPeriod: "week", recSeg: "sleep", date: null, draft: {}, errors: {}, foodOpen: false });

test("Hoje: sessão do dia com objetivo, registro, planejado × realizado e resumo", () => {
  const html = homeView(state(), baseUi(), now);
  assert.match(html, /Fartlek 1:3/);
  assert.match(html, /Objetivo:/);
  assert.match(html, /Registrar sessão realizada/);
  assert.match(html, /Planejado × realizado/);
  assert.match(html, /Hoje em números/);
  assert.match(html, /0 de 8 sessões registradas/);
});

test("Hoje: dia livre mostra descanso", () => {
  const s = state();
  s.schedule[3] = {};
  assert.match(homeView(s, { ...baseUi(), selectedDay: 3 }, now), /Dia de descanso/);
});

test("Hoje: sessão concluída aparece marcada", () => {
  const s = state();
  s.week.done["run-fartlek"] = true;
  const html = homeView(s, baseUi(), now);
  assert.match(html, /concluída/);
  assert.match(html, /Editar registro da sessão/);
  assert.match(html, /Desmarcar conclusão/);
});

test("Corrida: zonas com RPE, teste da fala, método e bpm marcado como estimado", () => {
  const html = runSection(state(), baseUi(), today);
  for (const key of RUN_KEYS) assert.ok(html.includes(`id="run-${key}"`));
  assert.match(html, /estimado · não calibrado/);
  assert.match(html, /Teste da fala/);
  assert.match(html, /RPE 9–10/);
  assert.match(html, /179–188 bpm \(est\.\)/);
  assert.match(html, /Cadência = passos por minuto/);
  assert.doesNotMatch(html, /180 spm/);
});

test("Corrida: com FCmáx medida as zonas ficam calibradas e sem '(est.)'", () => {
  const s = state();
  s.profile.measured = 200;
  const html = runSection(s, baseUi(), today);
  assert.match(html, /FCmáx medida/);
  assert.match(html, /190–200 bpm/);
  assert.doesNotMatch(html, /190–200 bpm \(est\.\)/);
});

test("Treinos A–D renderizam blocos, método e registro", () => {
  for (const k of LIFT_KEYS) {
    const html = trainView(state(), { ...baseUi(), trainSeg: k }, today);
    assert.match(html, /BLOCO 01/);
    assert.match(html, new RegExp(`Treino ${k}`));
    assert.match(html, /Objetivo:/);
    assert.match(html, /Registrar sessão realizada/);
  }
});

test("Treino A: série marcada e carga aparecem, com rótulo acessível", () => {
  const s = state();
  s.week.sets["A2-0"] = 2;
  s.loads["A2-0"] = 22.5;
  const html = trainView(s, { ...baseUi(), trainSeg: "A" }, today);
  assert.match(html, /chip on" data-act="set" data-id="A2-0" data-i="1"/);
  assert.match(html, /value="22.5" data-load="A2-0"/);
  assert.match(html, /aria-pressed="true"/);
});

test("Nutrição: diário vazio, referências pedem perfil e metas começam em branco", () => {
  const html = nutritionView(state(), baseUi(), today);
  assert.match(html, /Nenhum alimento registrado/);
  assert.match(html, /informe altura e peso/);
  assert.match(html, /Adicionar alimento/);
  assert.match(html, /Histórico/);
});

test("Nutrição: com perfil mostra TMB 1818, IMC e proteína — como estimativa", () => {
  const s = state();
  Object.assign(s.profile, { sex: "M", heightCm: 178, weightKg: 84, age: 28 });
  const html = nutritionView(s, baseUi(), today);
  assert.match(html, /1\.818 kcal\/dia/);
  assert.match(html, /não é meta calórica/);
  assert.match(html, /26,5 kg\/m²/);
  assert.match(html, /118–168 g\/dia/);
});

test("Nutrição: aviso quando a meta calórica está abaixo do metabolismo basal", () => {
  const s = state();
  Object.assign(s.profile, { sex: "M", heightCm: 178, weightKg: 84, age: 28 });
  s.nutrition.goals.kcal = 1400;
  assert.match(nutritionView(s, baseUi(), today), /nutricionista/);
});

test("Nutrição: lançamentos agrupados por refeição, com marca de estimativa", () => {
  const s = state();
  s.nutrition.entries = [{ id: "n1", date: today, time: "12:00", meal: "lunch", name: "Arroz", qty: 150, unit: "g", kcal: 195, protein: 4, carbs: 42, fat: 0, estimated: true }];
  const html = nutritionView(s, baseUi(), today);
  assert.match(html, /Almoço/);
  assert.match(html, /estimativa/);
  assert.match(html, /195 kcal/);
});

test("Hidratação: botões rápidos, sem meta fixa e orientações", () => {
  const html = nutritionView(state(), { ...baseUi(), nutriSeg: "water" }, today);
  assert.match(html, /\+200 ml/);
  assert.match(html, /Sem meta definida/);
  assert.match(html, /eletrólitos/);
  assert.match(html, /Antes do treino/);
});

test("Hidratação: progresso quando há meta", () => {
  const s = state();
  s.hydration.goalMl = 2000;
  s.hydration.entries = [{ id: "h", date: today, ml: 500, context: "day", time: "" }];
  assert.match(nutritionView(s, { ...baseUi(), nutriSeg: "water" }, today), /25% da meta de 2000 ml/);
});

test("Recuperação: sono, referência de 7 h e estado vazio dos gráficos", () => {
  const html = recoveryView(state(), baseUi(), today);
  assert.match(html, /Registrar sono/);
  assert.match(html, /7 h ou mais/);
  assert.match(html, /Sem registros neste período/);
});

test("Recuperação: resumo semanal e alerta descritivo de sono baixo", () => {
  const s = state();
  s.sleep = [{ id: "s", date: today, bed: "01:00", wake: "07:00", minutes: 360, quality: 3, fatigue: 4, restDay: false }];
  const html = recoveryView(s, baseUi(), today);
  assert.match(html, /6 h/);
  assert.match(html, /abaixo de 7 h/);
  assert.match(html, /não são diagnóstico/);
});

test("Recuperação: peso corporal", () => {
  const s = state();
  s.body = [{ id: "b", date: today, kg: 83.4 }];
  assert.match(recoveryView(s, { ...baseUi(), recSeg: "body" }, today), /83,4 kg/);
});

test("Painel: estado vazio explica lacunas; com dados mostra recordes e marcos", () => {
  assert.match(dashboardView(state(), baseUi(), today), /nunca como zero/);
  const s = state();
  s.logs = [{ id: "l", date: "2026-10-27", kind: "run", key: "interval", done: true, km: 5.5, durationMin: 50, rpe: 8 }];
  s.loadHistory = [{ date: "2026-10-20", id: "A2-0", kg: 26 }];
  const html = dashboardView(s, baseUi(), today);
  assert.match(html, /Supino reto c\/ halteres/);
  assert.match(html, /5,5/);
  assert.match(html, /role="img"/);
});

test("Ferramentas: perfil sem dados pessoais pré-preenchidos, zonas e 1RM", () => {
  const html = toolsView(state());
  assert.match(html, /Perfil/);
  assert.match(html, /não vêm preenchidos/);
  assert.match(html, /id="profile-heightCm"[^>]*value=""/);
  assert.match(html, /FCmáx e zonas/);
  assert.match(html, /Exportar backup/);
  assert.match(oneRepMaxResult(20, 10), /26.7 kg/);
  assert.match(oneRepMaxResult(NaN, NaN), /Informe carga/);
});

test("Formulário mostra erro acessível e preserva o rascunho", () => {
  const ui = { ...baseUi(), nutriSeg: "water", errors: { water: { ml: "Informe um volume inteiro entre 1 e 3000 ml." } }, draft: { water: { ml: "abc" } } };
  const html = nutritionView(state(), ui, today);
  assert.match(html, /role="alert"/);
  assert.match(html, /aria-invalid="true"/);
  assert.match(html, /value="abc"/);
});

test("Texto do usuário é escapado nas telas", () => {
  const s = state();
  s.nutrition.entries = [{ id: "n", date: today, meal: "lunch", name: '<img src=x onerror="a()">', qty: 1, unit: "un", estimated: true }];
  s.profile.restrictions = "<script>alert(1)</script>";
  assert.doesNotMatch(nutritionView(s, baseUi(), today), /<img src=x/);
  assert.doesNotMatch(toolsView(s), /<script>alert/);
});
