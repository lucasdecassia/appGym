// Integração do controlador: DOM simulado dispara cliques e formulários reais contra o store.
import test from "node:test";
import assert from "node:assert/strict";

const handlers = {};
const elements = {};
const alerts = [];
const el = (id) => (elements[id] ??= { id, innerHTML: "", textContent: "", hidden: false, value: "", click() {} });
globalThis.document = {
  getElementById: el, querySelectorAll: () => [], querySelector: () => null,
  addEventListener: (type, fn) => { handlers[type] = fn; },
  createElement: () => ({ click() {}, remove() {} }), body: { append() {} },
};
globalThis.window = { scrollTo() {} };
globalThis.alert = (m) => alerts.push(m);
globalThis.confirm = () => true;
URL.createObjectURL = () => "blob:x";
URL.revokeObjectURL = () => {};

const { getState } = await import("./store/store.js");
await import("./main.js");
const { dateKey } = await import("./lib/dates.js");
const today = dateKey();

const fields = (obj) => Object.entries(obj).map(([f, value]) => ({ dataset: { f }, type: typeof value === "boolean" ? "checkbox" : "text", value, checked: value === true }));
const box = (formId, data, dataset = {}) => ({ dataset: { form: formId, ...dataset }, querySelectorAll: () => fields(data) });
function click(act, dataset = {}, form = null) {
  const button = { dataset: { act, ...dataset }, disabled: false, closest: (sel) => (sel === "[data-act]" ? button : sel === "[data-form]" ? form : null) };
  handlers.click({ target: { closest: (sel) => button.closest(sel) } });
}
const view = () => elements.main.innerHTML;

test("renderização inicial e status", () => {
  assert.match(view(), /Seu progresso da semana/);
  assert.equal(elements.status.textContent, "Salvo neste aparelho");
});

test("navegação entre as 6 abas", () => {
  for (const [tab, text] of [["train", "Zonas de corrida"], ["nutri", "Diário alimentar"], ["recov", "Registrar sono"], ["dash", "Painel"], ["tools", "Perfil"], ["home", "Seu progresso"]]) {
    click("tab", { v: tab });
    assert.match(view(), new RegExp(text), tab);
  }
});

test("água: erro de validação aparece; valor válido é gravado", () => {
  click("tab", { v: "nutri" }); click("nutriSeg", { v: "water" });
  click("addWater", {}, box("water", { context: "day", time: "", ml: "abc" }, { date: today }));
  assert.match(view(), /Informe um volume inteiro/);
  assert.equal(getState().hydration.entries.length, 0);
  click("addWater", { ml: "500" }, box("water", { context: "during", time: "", ml: "" }, { date: today }));
  assert.equal(getState().hydration.entries.length, 1);
  assert.equal(getState().hydration.entries[0].context, "during");
  assert.match(view(), /500 ml/);
});

test("alimento: grava, favorita, reaproveita favorito e exclui", () => {
  click("nutriSeg", { v: "diary" });
  const food = { meal: "lunch", time: "12:30", name: "Frango", qty: "150", unit: "g", kcal: "250", protein: "45", carbs: "", fat: "5", fiber: "", estimated: true };
  click("saveFood", {}, box("food", food, { date: today }));
  const [entry] = getState().nutrition.entries;
  assert.equal(entry.name, "Frango");
  assert.equal(entry.carbs, null);
  click("favoriteFood", { id: entry.id });
  click("favoriteFood", { id: entry.id }); // não duplica
  assert.equal(getState().nutrition.favorites.length, 1);
  click("useFavorite", { id: getState().nutrition.favorites[0].id });
  assert.match(view(), /value="Frango"/);
  click("deleteEntry", { coll: "nutrition", id: entry.id });
  assert.equal(getState().nutrition.entries.length, 0);
});

test("alimento inválido não grava e mostra os erros", () => {
  click("saveFood", {}, box("food", { meal: "lunch", name: "", qty: "0", unit: "g", kcal: "9999", estimated: true }, { date: today }));
  assert.equal(getState().nutrition.entries.length, 0);
  assert.match(view(), /Informe o alimento/);
});

test("metas e meta de água", () => {
  click("saveGoals", {}, box("goals", { kcal: "", protein: "140", carbs: "", fat: "" }));
  assert.equal(getState().nutrition.goals.protein, 140);
  assert.equal(getState().nutrition.goals.kcal, null);
  click("nutriSeg", { v: "water" });
  click("saveWaterGoal", {}, box("waterGoal", { waterMl: "2500" }));
  assert.equal(getState().hydration.goalMl, 2500);
});

test("sono: grava um por data (substitui) e valida", () => {
  click("tab", { v: "recov" });
  const sleep = { date: today, bed: "23:00", wake: "06:30", quality: "4", feeling: "", fatigue: "2", soreness: "", restDay: false, notes: "" };
  click("saveSleep", {}, box("sleep", sleep));
  click("saveSleep", {}, box("sleep", { ...sleep, quality: "5" }));
  assert.equal(getState().sleep.length, 1);
  assert.equal(getState().sleep[0].quality, 5);
  assert.equal(getState().sleep[0].minutes, 450);
  click("saveSleep", {}, box("sleep", { ...sleep, wake: "23:00" }));
  assert.match(view(), /não podem ser iguais/);
});

test("peso corporal", () => {
  click("recSeg", { v: "body" });
  click("saveBody", {}, box("body", { date: today, kg: "83,4" }));
  assert.equal(getState().body[0].kg, 83.4);
});

test("registro de sessão: grava log, conclui a sessão e atualiza o painel", () => {
  click("tab", { v: "train" });
  click("saveLog", {}, box("log-run-fartlek", { date: today, durationMin: "70", km: "12", cadenceAvg: "172", cadenceMax: "180", rpe: "8", notes: "ok" }, { kind: "run", key: "fartlek" }));
  assert.equal(getState().logs.length, 1);
  assert.equal(getState().week.done["run-fartlek"], true);
  click("tab", { v: "dash" });
  assert.match(view(), /12/);
  click("tab", { v: "train" });
  click("saveLog", {}, box("log-run-fartlek", { date: today, durationMin: "70", km: "12", cadenceAvg: "172", cadenceMax: "150", rpe: "8", notes: "" }, { kind: "run", key: "fartlek" }));
  assert.match(view(), /não pode ser menor que a média/);
});

test("séries, cargas e histórico de cargas", () => {
  click("trainSeg", { v: "A" });
  click("set", { id: "A2-0", i: "1" });
  assert.equal(getState().week.sets["A2-0"], 2);
  click("set", { id: "A2-0", i: "1" });
  assert.equal(getState().week.sets["A2-0"], 1);
  handlers.change({ target: { dataset: { load: "A2-0" }, value: "24" } });
  assert.equal(getState().loads["A2-0"], 24);
  assert.equal(getState().loadHistory.length, 1);
  handlers.change({ target: { dataset: { load: "A2-0" }, value: "26" } });
  assert.equal(getState().loadHistory.length, 1);
  assert.equal(getState().loadHistory[0].kg, 26);
});

test("perfil: grava e passa a calcular referências", () => {
  click("tab", { v: "tools" });
  click("saveProfile", {}, box("profile", { age: "28", sex: "M", heightCm: "178", weightKg: "84", objective: "performance", restrictions: "" }));
  assert.equal(getState().profile.weightKg, 84);
  click("tab", { v: "nutri" }); click("nutriSeg", { v: "diary" });
  assert.match(view(), /1\.818 kcal\/dia/);
  click("saveProfile", {}, box("profile", { age: "3", sex: "M", heightCm: "", weightKg: "", objective: "", restrictions: "" }));
  assert.equal(getState().profile.age, 28);
});

test("FCmáx medida e fórmula", () => {
  handlers.change({ target: { dataset: { hr: "measured" }, value: "190" } });
  assert.equal(getState().profile.measured, 190);
  handlers.change({ target: { dataset: { hr: "measured" }, value: "20" } });
  assert.equal(getState().profile.measured, null);
  handlers.change({ target: { dataset: { hr: "formula" }, value: "haskell" } });
  assert.equal(getState().profile.formula, "haskell");
});

test("exportações não lançam erro e importação rejeita arquivo inválido", async () => {
  for (const kind of ["training", "nutrition", "hydration", "sleep"]) click("exportCsv", { v: kind });
  click("exportJson");
  handlers.change({ target: { id: "backup-file", dataset: {}, files: [{ text: async () => "lixo" }], value: "x" } });
  await new Promise((r) => setTimeout(r, 10));
  assert.ok(alerts.some((m) => /JSON válido/.test(m)));
});

test("semana-tipo e reset", () => {
  handlers.change({ target: { dataset: { sched: "3:lift" }, value: "B" } });
  assert.equal(getState().schedule[3].lift, "B");
  click("resetSchedule");
  assert.equal(getState().schedule[3].lift, "D");
  click("resetWeek");
  assert.deepEqual(getState().week.done, {});
});
