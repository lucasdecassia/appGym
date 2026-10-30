import { getState, update, subscribe, replaceState } from "./store/store.js";
import { DEFAULT_SCHEDULE } from "./data/plan.js";
import { mondayIndex, weekKey } from "./lib/week.js";
import { nextSetCount } from "./lib/exercises.js";
import { buildBackup, parseBackup } from "./services/backup.js";
import { startTimer, addTime, stopTimer } from "./components/timer.js";
import { homeView } from "./views/home.js";
import { runView } from "./views/run.js";
import { liftView } from "./views/lift.js";
import { toolsView, oneRepMaxResult } from "./views/tools.js";

const VIEWS = { home: homeView, run: runView, lift: liftView, tools: toolsView };
const ui = { tab: "home", selectedDay: mondayIndex(), lift: "A", openRun: null };

const $ = (id) => document.getElementById(id);

function render() {
  $("main").innerHTML = VIEWS[ui.tab](getState(), ui, new Date());
  for (const button of document.querySelectorAll("#nav button")) {
    button.classList.toggle("on", button.dataset.v === ui.tab);
  }
}

function goTo(tab, { keepScroll = false } = {}) {
  ui.tab = tab;
  render();
  if (!keepScroll) window.scrollTo(0, 0);
}

function downloadBackup() {
  const { filename, json } = buildBackup(getState());
  const url = URL.createObjectURL(new Blob([json], { type: "application/json" }));
  const link = Object.assign(document.createElement("a"), { href: url, download: filename });
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const actions = {
  tab: (b) => goTo(b.dataset.v),
  selectDay: (b) => { ui.selectedDay = Number(b.dataset.v); render(); },
  selectLift: (b) => { ui.lift = b.dataset.v; render(); },
  openRun: (b) => {
    ui.openRun = b.dataset.v;
    goTo("run", { keepScroll: true });
    ui.openRun = null;
    $(`run-${b.dataset.v}`)?.scrollIntoView({ block: "start" });
  },
  openLift: (b) => { ui.lift = b.dataset.v; goTo("lift"); },
  done: (b) => update((s) => { s.week.done[b.dataset.v] = !s.week.done[b.dataset.v]; }),
  set: (b) => update((s) => {
    const id = b.dataset.id;
    s.week.sets[id] = nextSetCount(s.week.sets[id] || 0, Number(b.dataset.i));
  }),
  rest: (b) => startTimer(Number(b.dataset.s), b.dataset.l),
  timerAdd: () => addTime(15),
  timerStop: () => stopTimer(),
  resetWeek: () => {
    if (confirm("Zerar o progresso desta semana?")) update((s) => { s.week = { key: weekKey(), done: {}, sets: {} }; });
  },
  resetSchedule: () => update((s) => { s.schedule = structuredClone(DEFAULT_SCHEDULE); }),
  exportBackup: downloadBackup,
  importBackup: () => $("backup-file").click(),
};

document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-act]");
  if (button) actions[button.dataset.act]?.(button);
});

document.addEventListener("change", (event) => {
  const t = event.target;
  if (t.dataset.load) {
    const value = parseFloat(t.value);
    update((s) => { if (Number.isNaN(value)) delete s.loads[t.dataset.load]; else s.loads[t.dataset.load] = value; }, { silent: true });
  } else if (t.dataset.profile) {
    const field = t.dataset.profile;
    update((s) => {
      if (field === "age") { const n = parseInt(t.value, 10); s.profile.age = n >= 10 && n <= 90 ? n : 28; }
      else if (field === "measured") { const n = parseInt(t.value, 10); s.profile.measured = n >= 120 && n <= 230 ? n : null; }
      else s.profile[field] = t.value;
    });
  } else if (t.dataset.sched) {
    const [day, field] = t.dataset.sched.split(":");
    update((s) => {
      s.schedule[Number(day)] ||= {};
      if (t.value) s.schedule[Number(day)][field] = t.value; else delete s.schedule[Number(day)][field];
    }, { silent: true });
  } else if (t.id === "backup-file" && t.files?.[0]) {
    t.files[0].text()
      .then((text) => { replaceState(parseBackup(text)); alert("Backup importado com sucesso."); })
      .catch((error) => alert(error.message))
      .finally(() => { t.value = ""; });
  }
});

document.addEventListener("input", (event) => {
  if (!event.target.hasAttribute("data-rm")) return;
  $("rm-result").innerHTML = oneRepMaxResult(parseFloat($("rm-weight").value), parseFloat($("rm-reps").value));
});

subscribe(render);
render();

if ("serviceWorker" in navigator && document.querySelector('meta[name="app-env"]')?.content === "production") {
  navigator.serviceWorker.register("./sw.js").catch(() => { /* offline é um extra */ });
}
