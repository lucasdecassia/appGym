import { RUNS, RUN_KEYS, LIFTS, LIFT_KEYS, ZONES, METHOD_CLASS, METHOD_HELP, phaseOf } from "../data/plan.js";
import { maxHeartRate, zoneCalibration } from "../lib/heartRate.js";
import { runKm, runMinutes, formatKm, formatStepVolume } from "../lib/runStats.js";
import { exerciseId, setsNeeded, liftProgress } from "../lib/exercises.js";
import { isItemDone } from "../lib/progress.js";
import { esc, zoneBadge, bpmText, calibrationTag, progressBar } from "../components/html.js";
import { sessionLogForm } from "../components/sessionLog.js";

const zoneInfo = (id) => ZONES.find((z) => z.id === id);

function zoneGuide(state) {
  const c = zoneCalibration(state.profile);

  const rows = ZONES.map((z) => `
    <div class="zone-row">
      <div class="row">
        ${zoneBadge(z.id)}
        <b>${esc(z.name)}</b>
      </div>

      <dl>
        <dt>Pace médio</dt>
        <dd><strong class="zone-pace-value">${esc(z.pace || "Não definido")}</strong></dd>

        <dt>Esforço (RPE)</dt>
        <dd>${esc(z.rpe)} de 10</dd>

        <dt>Teste da fala</dt>
        <dd>${esc(z.talk)}</dd>

        <dt>Propósito</dt>
        <dd>${esc(z.purpose)}</dd>

        <dt>Bloco típico</dt>
        <dd>${esc(z.block)}</dd>

        <dt>Recuperação</dt>
        <dd>${esc(z.recovery)}</dd>

        <dt>Faixa (bpm)</dt>
        <dd>${bpmText(state.profile, z.id)}</dd>
      </dl>
    </div>
  `).join("");

  return `
    <div class="card">
      <div class="row sp">
        <h3>Zonas de corrida Z1–Z5</h3>
        ${calibrationTag(state.profile)}
      </div>

      <div class="muted" style="margin-top:6px">
        Zonas são faixas de intensidade, não valores exatos.
        Método usado: <b>${esc(c.method)}</b>
        (FCmáx ${maxHeartRate(state.profile)} bpm).
        ${c.calibrated ? "" : " Sem FCmáx medida, guie-se primeiro pelo esforço (RPE) e pelo teste da fala; os bpm são aproximados."}
      </div>

      <details class="inner">
        <summary>Como sentir cada zona</summary>
        ${rows}
        <div class="note">
          Modelo didático (RPE e fala) para orientar a execução;
          os limites individuais dependem de teste.
          Os paces apresentados são referências ilustrativas.
        </div>
      </details>
    </div>
  `;
}

function runCard(state, ui, key, today) {
  const run = RUNS[key];
  const done = isItemDone(state.week, { type: "run", key });
  const steps = run.steps.map((s) => {
    const z = zoneInfo(s.zone);
    return `<div class="step">${zoneBadge(s.zone)}<div class="grow"><div class="phase">${phaseOf(s.label)}</div><div class="t">${esc(s.label)}</div>
      <div class="bpm">RPE ${z.rpe} · ${esc(z.talk)}</div><div class="bpm">${bpmText(state.profile, step.zone)}</div></div><b>${formatStepVolume(s)}</b></div>`;
  }).join("");
  return `<details class="card" ${ui.openRun === key ? "open" : ""} id="run-${key}"><summary><div class="row sp">
    <div class="grow"><div class="muted">${run.day}</div><h3>${esc(run.name)}</h3></div>
    <div style="text-align:right"><b>${formatKm(runKm(run))} km</b><div class="muted">${done ? "✓ concluída" : "toque para abrir"}</div></div></div></summary>
    <p style="margin:10px 0 4px"><b>Objetivo:</b> ${esc(run.objective)}</p>
    <p class="muted" style="margin:0 0 4px"><b>Por que está no plano:</b> ${esc(run.why)}</p>
    <p class="muted" style="margin:0 0 8px"><b>Como executar:</b> ${esc(run.howTo)}</p>
    <div class="muted">Duração/distância: ${formatKm(runKm(run))} km + ${runMinutes(run)} min em etapas cronometradas.</div>${steps}
    ${sessionLogForm(state, ui, "run", key, today)}</details>`;
}

export function runSection(state, ui, today) {
  return `<div class="banner">Antes de toda corrida: aquecimento dinâmico. Faixas de zona e percepções são orientação geral, não prescrição.</div>${zoneGuide(state)}${RUN_KEYS.map((k) => runCard(state, ui, k, today)).join("")}`;
}

function exerciseRow(state, liftKey, block, exercise, index) {
  const id = exerciseId(liftKey, block, index);
  const got = state.week.sets[id] || 0;
  const letter = block.exercises.length > 1 ? `${String.fromCharCode(65 + index)}. ` : "";
  let html = `<div class="ex"><div class="row sp"><div class="nm grow">${letter}${esc(exercise.name)}</div>`;
  if (exercise.sets) html += `<span class="pill">${exercise.sets} × ${esc(exercise.reps)}</span>`;
  html += "</div>";
  if (exercise.note) html += `<div class="note">${esc(exercise.note)}</div>`;
  html += '<div class="chips">';
  if (exercise.sets) {
    for (let j = 0; j < setsNeeded(exercise); j++) {
      html += `<button class="chip${j < got ? " on" : ""}" data-act="set" data-id="${id}" data-i="${j}" aria-pressed="${j < got}" aria-label="Série ${j + 1}${j < got ? " feita" : ""}">${j + 1}</button>`;
    }
    const load = state.loads[id];
    html += `<span style="flex:1"></span><label class="sr-only" for="load-${id}">Carga em kg: ${esc(exercise.name)}</label><input class="load" id="load-${id}" type="number" inputmode="decimal" step="0.5" min="0" placeholder="kg" value="${load == null ? "" : esc(load)}" data-load="${id}"><span class="muted">kg</span>`;
  } else {
    html += `<button class="chip wide${got >= 1 ? " on" : ""}" data-act="set" data-id="${id}" data-i="0" aria-pressed="${got >= 1}">${got >= 1 ? "✓ Feito" : "Marcar como feito"}</button>`;
  }
  html += "</div></div>";
  if (index < block.exercises.length - 1) html += '<div class="link">↓ sem pausa ↓</div>';
  return html;
}

function blockCard(state, liftKey, block) {
  const rows = block.exercises.map((exercise, i) => exerciseRow(state, liftKey, block, exercise, i)).join("");
  const label = esc(`${LIFTS[liftKey].title} · bloco ${block.number}`);
  return `<div class="card"><div class="row sp"><span class="meth ${METHOD_CLASS[block.method]}">BLOCO ${String(block.number).padStart(2, "0")} · ${esc(block.method)}</span>
    <button class="rest" data-act="rest" data-s="${block.rest.seconds}" data-l="${label}">⏱ pausa ${block.rest.label}</button></div>
    ${METHOD_HELP[block.method] ? `<div class="note">${esc(METHOD_HELP[block.method])}</div>` : ""}${rows}</div>`;
}

export function liftSection(state, ui, today) {
  const key = ui.lift;
  const lift = LIFTS[key];
  const progress = liftProgress(state.week, key);
  return `<div class="card"><h3>${lift.title} · ${esc(lift.focus)}</h3>
    <p style="margin:8px 0 2px"><b>Objetivo:</b> ${esc(lift.objective)}</p>
    ${progressBar(progress.percent)}<div class="muted">${progress.done} de ${progress.total} exercícios · toque nos círculos para marcar cada série e no ⏱ para o descanso. Séries e cargas são sugestões do plano: ajuste conforme técnica e recuperação.</div>
    ${sessionLogForm(state, ui, "lift", key, today)}</div>${lift.blocks.map((b) => blockCard(state, key, b)).join("")}`;
}

export function trainView(state, ui, today) {
  const tabs = [["run", "Corrida"], ...LIFT_KEYS.map((k) => [k, k])];
  const seg = tabs.map(([id, label]) => `<button class="${id === ui.trainSeg ? "on" : ""}" data-act="trainSeg" data-v="${id}" aria-pressed="${id === ui.trainSeg}">${id.length === 1 ? "Treino " : ""}${label}</button>`).join("");
  const body = ui.trainSeg === "run" ? runSection(state, ui, today) : liftSection(state, { ...ui, lift: ui.trainSeg }, today);
  return `<h2>Treinos</h2><div class="seg" role="group" aria-label="Escolher treino">${seg}</div>${body}`;
}
