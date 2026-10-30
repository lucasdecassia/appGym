import { RUNS, RUN_KEYS, ZONES } from "../data/plan.js";
import { maxHeartRate, zoneLabel } from "../lib/heartRate.js";
import { runKm, formatKm, formatStepVolume } from "../lib/runStats.js";
import { isItemDone, doneKey } from "../lib/progress.js";
import { esc, zoneBadge, allZonesWithBpm, doneButton } from "../components/html.js";

function runCard(state, ui, key) {
  const run = RUNS[key];
  const done = isItemDone(state.week, { type: "run", key });
  const steps = run.steps
    .map((s) => `<div class="step">${zoneBadge(s.zone)}<div class="grow"><div class="t">${esc(s.label)}</div><div class="bpm">${zoneLabel(state.profile, s.zone)}</div></div><b>${formatStepVolume(s)}</b></div>`)
    .join("");
  return `<details class="card" ${ui.openRun === key ? "open" : ""} id="run-${key}"><summary><div class="row sp">
    <div class="grow"><div class="muted">${run.day}</div><h3>${esc(run.name)}</h3></div>
    <div style="text-align:right"><b>${formatKm(runKm(run))} km</b><div class="muted">${done ? "✓ feita" : "toque para abrir"}</div></div></div></summary>
    <div class="muted" style="margin:8px 0">${esc(run.summary)}</div>${steps}
    <div style="margin-top:10px">${doneButton(doneKey({ type: "run", key }), done, "✓ Concluída", "Concluir corrida")}</div></details>`;
}

export function runView(state, ui) {
  return `<h2>Corrida · 21 km</h2><div class="card"><div class="muted">FCmáx usada: <b>${maxHeartRate(state.profile)} bpm</b> · altere em Ferramentas. Antes de toda corrida: aquecimento dinâmico.</div>
    <div class="chips" style="margin-top:8px">${allZonesWithBpm(state.profile)}</div></div>
    ${RUN_KEYS.map((key) => runCard(state, ui, key)).join("")}`;
}
