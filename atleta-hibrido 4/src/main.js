import { getState, update, subscribe, replaceState } from "./store/store.js";
import { DEFAULT_SCHEDULE } from "./data/plan.js";
import { mondayIndex, weekKey } from "./lib/week.js";
import { dateKey, parseDateKey, addDays } from "./lib/dates.js";
import { nextSetCount, recordLoad } from "./lib/exercises.js";
import { newId } from "./lib/ids.js";
import { validateFood, favoriteFromEntry, isSameFavorite } from "./lib/nutrition.js";
import { validateHydration } from "./lib/hydration.js";
import { validateSleep } from "./lib/sleep.js";
import { validateLog, upsertLog } from "./lib/logs.js";
import { validateProfile, validateGoals, validateBodyWeight } from "./lib/profile.js";
import { buildBackup, parseBackup } from "./services/backup.js";
import { buildSessionPrompt } from "./lib/aiPrompt.js";
import { buildCsv } from "./services/exports.js";
import { startTimer, addTime, stopTimer } from "./components/timer.js";
import { homeView } from "./views/home.js";
import { trainView } from "./views/train.js";
import { nutritionView } from "./views/nutrition.js";
import { recoveryView } from "./views/recovery.js";
import { dashboardView } from "./views/dashboard.js";
import { toolsView, oneRepMaxResult } from "./views/tools.js";

const ui = { ai: null, tab: "home", selectedDay: mondayIndex(), trainSeg: "run", lift: "A", openRun: null, nutriSeg: "diary", nutriPeriod: "week", recSeg: "sleep", date: null, draft: {}, errors: {}, foodOpen: false };
const $ = (id) => document.getElementById(id);
const nowIso = () => new Date().toISOString();

function setStatus(saved) {
  const el = $("status");
  el.textContent = saved ? "Salvo neste aparelho" : "⚠ Não foi possível salvar";
  if (!saved) alert("Não foi possível salvar no armazenamento do navegador (cheio ou bloqueado). Exporte um backup em Ferramentas.");
}

function render() {
  const state = getState();
  const now = new Date();
  const today = dateKey(now);
  const html = {
    home: () => homeView(state, ui, now),
    train: () => trainView(state, ui, today),
    nutri: () => nutritionView(state, ui, today),
    recov: () => recoveryView(state, ui, today),
    dash: () => dashboardView(state, ui, today),
    tools: () => toolsView(state, ui),
  }[ui.tab]();
  $("main").innerHTML = html;
  for (const button of document.querySelectorAll("#nav button")) {
    const on = button.dataset.v === ui.tab;
    button.classList.toggle("on", on);
    button.setAttribute("aria-current", on ? "page" : "false");
  }
  document.querySelector('[aria-invalid="true"]')?.focus();
}

function goTo(tab, { keepScroll = false } = {}) {
  ui.tab = tab;
  render();
  if (!keepScroll) window.scrollTo(0, 0);
}

/** Lê todos os campos [data-f] de um formulário. */
function readForm(container) {
  const values = {};
  for (const el of container.querySelectorAll("[data-f]")) values[el.dataset.f] = el.type === "checkbox" ? el.checked : el.value;
  return values;
}

/** Valida; em erro mantém o rascunho e mostra mensagens; em sucesso aplica a mudança no estado. */
function submit(formId, raw, validate, apply) {
  const result = validate(raw);
  if (!result.ok) {
    ui.errors[formId] = result.errors;
    ui.draft[formId] = raw;
    render();
    return false;
  }
  delete ui.errors[formId];
  delete ui.draft[formId];
  setStatus(update((s) => apply(s, result.value)));
  return true;
}

function download(filename, text, type) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = Object.assign(document.createElement("a"), { href: url, download: filename });
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function copyText(text) {
  if (!navigator.clipboard?.writeText) return Promise.resolve(false);
  return navigator.clipboard.writeText(text).then(() => true, () => false);
}

const COLLECTIONS = { nutrition: (s) => s.nutrition.entries, hydration: (s) => s.hydration.entries, sleep: (s) => s.sleep, body: (s) => s.body };
const setCollection = (s, name, rows) => {
  if (name === "nutrition") s.nutrition.entries = rows; else if (name === "hydration") s.hydration.entries = rows; else s[name] = rows;
};
const str = (v) => (v == null ? "" : String(v));

const actions = {
  tab: (b) => goTo(b.dataset.v),
  selectDay: (b) => { ui.selectedDay = Number(b.dataset.v); render(); },
  trainSeg: (b) => { ui.trainSeg = b.dataset.v; render(); },
  nutriSeg: (b) => { ui.nutriSeg = b.dataset.v; render(); },
  nutriPeriod: (b) => { ui.nutriPeriod = b.dataset.v; render(); },
  recSeg: (b) => { ui.recSeg = b.dataset.v; render(); },
  shiftDay: (b) => {
    const today = dateKey();
    const next = addDays(ui.date || today, Number(b.dataset.v));
    ui.date = next > today ? today : next;
    render();
  },
  openRun: (b) => {
    ui.trainSeg = "run";
    ui.openRun = b.dataset.v;
    goTo("train", { keepScroll: true });
    ui.openRun = null;
    $(`run-${b.dataset.v}`)?.scrollIntoView({ block: "start" });
  },
  openLift: (b) => { ui.trainSeg = b.dataset.v; goTo("train"); },
  done: (b) => setStatus(update((s) => { s.week.done[b.dataset.v] = !s.week.done[b.dataset.v]; })),
  set: (b) => setStatus(update((s) => {
    const id = b.dataset.id;
    s.week.sets[id] = nextSetCount(s.week.sets[id] || 0, Number(b.dataset.i));
  })),
  rest: (b) => startTimer(Number(b.dataset.s), b.dataset.l),
  timerAdd: () => addTime(15),
  timerStop: () => stopTimer(),
  resetWeek: () => { if (confirm("Zerar o progresso desta semana?")) setStatus(update((s) => { s.week = { key: weekKey(), done: {}, sets: {} }; })); },
  resetSchedule: () => setStatus(update((s) => { s.schedule = structuredClone(DEFAULT_SCHEDULE); })),
  exportJson: () => { const { filename, json } = buildBackup(getState()); download(filename, json, "application/json"); },
  exportCsv: (b) => { const { filename, text } = buildCsv(b.dataset.v, getState()); download(filename, text, "text/csv;charset=utf-8"); },
  importBackup: () => $("backup-file").click(),
  askAi: (b) => {
    const text = buildSessionPrompt(b.dataset.kind, b.dataset.key);
    ui.ai = { text, copied: false };
    render();
    window.scrollTo(0, 0);
    copyText(text).then((ok) => { if (ui.ai?.text === text) { ui.ai.copied = ok; render(); } });
  },
  copyAi: () => { const text = ui.ai?.text; if (text) copyText(text).then((ok) => { if (ui.ai?.text === text) { ui.ai.copied = ok; render(); } }); },
  closeAi: () => { ui.ai = null; render(); },

  saveLog: (b) => {
    const box = b.closest("[data-form]");
    const { kind, key } = box.dataset;
    submit(box.dataset.form, { ...readForm(box), kind, key }, validateLog, (s, v) => {
      s.logs = upsertLog(s.logs, v, { id: newId("log"), now: nowIso() });
      if (weekKey(parseDateKey(v.date)) === s.week.key) s.week.done[`${kind}-${key}`] = true;
    });
  },
  saveFood: (b) => {
    const box = b.closest("[data-form]");
    const ok = submit("food", { ...readForm(box), date: box.dataset.date }, validateFood, (s, v) => {
      s.nutrition.entries.push({ id: newId("food"), ...v, createdAt: nowIso() });
    });
    if (ok) ui.foodOpen = false;
  },
  favoriteFood: (b) => setStatus(update((s) => {
    const entry = s.nutrition.entries.find((e) => e.id === b.dataset.id);
    if (!entry) return;
    const fav = favoriteFromEntry(entry);
    if (!s.nutrition.favorites.some((f) => isSameFavorite(f, fav))) s.nutrition.favorites.push({ id: newId("fav"), ...fav });
  })),
  useFavorite: (b) => {
    const f = getState().nutrition.favorites.find((x) => x.id === b.dataset.id);
    if (!f) return;
    ui.draft.food = { meal: f.meal || "lunch", name: f.name, qty: str(f.qty), unit: f.unit, kcal: str(f.kcal), protein: str(f.protein), carbs: str(f.carbs), fat: str(f.fat), fiber: str(f.fiber), estimated: true, time: "" };
    ui.foodOpen = true;
    render();
  },
  deleteFavorite: (b) => setStatus(update((s) => { s.nutrition.favorites = s.nutrition.favorites.filter((f) => f.id !== b.dataset.id); })),
  deleteEntry: (b) => {
    const name = b.dataset.coll;
    if (COLLECTIONS[name] && confirm("Excluir este registro? Esta ação não pode ser desfeita.")) {
      setStatus(update((s) => setCollection(s, name, COLLECTIONS[name](s).filter((e) => e.id !== b.dataset.id))));
    }
  },
  saveGoals: (b) => {
    const raw = readForm(b.closest("[data-form]"));
    submit("goals", raw, (r) => validateGoals({ ...r, waterMl: getState().hydration.goalMl }), (s, v) => { s.nutrition.goals = { kcal: v.kcal, protein: v.protein, carbs: v.carbs, fat: v.fat }; });
  },
  saveWaterGoal: (b) => {
    submit("waterGoal", readForm(b.closest("[data-form]")), (r) => validateGoals({ waterMl: r.waterMl }), (s, v) => { s.hydration.goalMl = v.waterMl; });
  },
  addWater: (b) => {
    const box = b.closest("[data-form]");
    const raw = readForm(box);
    if (b.dataset.ml) raw.ml = b.dataset.ml;
    submit("water", { ...raw, date: box.dataset.date }, validateHydration, (s, v) => { s.hydration.entries.push({ id: newId("water"), ...v, createdAt: nowIso() }); });
  },
  saveSleep: (b) => {
    submit("sleep", readForm(b.closest("[data-form]")), validateSleep, (s, v) => {
      s.sleep = [...s.sleep.filter((e) => e.date !== v.date), { id: newId("sleep"), ...v, createdAt: nowIso() }];
    });
  },
  saveBody: (b) => {
    submit("body", readForm(b.closest("[data-form]")), validateBodyWeight, (s, v) => { s.body.push({ id: newId("body"), ...v, createdAt: nowIso() }); });
  },
  saveProfile: (b) => {
    submit("profile", readForm(b.closest("[data-form]")), validateProfile, (s, v) => { Object.assign(s.profile, v); });
  },
};

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-act]");
  if (button && !button.disabled) actions[button.dataset.act]?.(button);
});

document.addEventListener("change", (event) => {
  const t = event.target;
  if (t.dataset.load) {
    const value = parseFloat(t.value);
    setStatus(update((s) => {
      if (Number.isNaN(value)) delete s.loads[t.dataset.load]; else s.loads[t.dataset.load] = value;
      s.loadHistory = recordLoad(s.loadHistory, { date: dateKey(), id: t.dataset.load, kg: value });
    }, { silent: true }));
  } else if (t.dataset.hr) {
    setStatus(update((s) => {
      if (t.dataset.hr === "measured") { const n = parseInt(t.value, 10); s.profile.measured = n >= 120 && n <= 230 ? n : null; }
      else s.profile.formula = t.value;
    }));
  } else if (t.dataset.sched) {
    const [day, field] = t.dataset.sched.split(":");
    setStatus(update((s) => {
      s.schedule[Number(day)] ||= {};
      if (t.value) s.schedule[Number(day)][field] = t.value; else delete s.schedule[Number(day)][field];
    }, { silent: true }));
  } else if (t.id === "backup-file" && t.files?.[0]) {
    t.files[0].text()
      .then((text) => { replaceState(parseBackup(text)); alert("Backup importado com sucesso."); })
      .catch((error) => alert(error.message))
      .finally(() => { t.value = ""; });
  }
});

document.addEventListener("input", (event) => {
  if (event.target.hasAttribute?.("data-rm")) $("rm-result").innerHTML = oneRepMaxResult(parseFloat($("rm-weight").value), parseFloat($("rm-reps").value));
});

subscribe(render);
render();
setStatus(true);

if ("serviceWorker" in navigator && document.querySelector('meta[name="app-env"]')?.content === "production") {
  navigator.serviceWorker.register("./sw.js").catch(() => { /* offline é um extra */ });
}
