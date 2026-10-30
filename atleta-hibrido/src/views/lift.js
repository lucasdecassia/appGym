import { LIFTS, LIFT_KEYS, METHOD_CLASS } from "../data/plan.js";
import { exerciseId, setsNeeded, liftProgress } from "../lib/exercises.js";
import { isItemDone, doneKey } from "../lib/progress.js";
import { esc, progressBar, doneButton } from "../components/html.js";

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
      html += `<button class="chip${j < got ? " on" : ""}" data-act="set" data-id="${id}" data-i="${j}" aria-label="Série ${j + 1}">${j + 1}</button>`;
    }
    const load = state.loads[id];
    html += `<span style="flex:1"></span><input class="load" type="number" inputmode="decimal" step="0.5" min="0" placeholder="kg" value="${load == null ? "" : esc(load)}" data-load="${id}" aria-label="Carga em kg"><span class="muted">kg</span>`;
  } else {
    html += `<button class="chip wide${got >= 1 ? " on" : ""}" data-act="set" data-id="${id}" data-i="0">${got >= 1 ? "✓ Feito" : "Marcar como feito"}</button>`;
  }
  html += "</div></div>";
  if (index < block.exercises.length - 1) html += '<div class="link">↓ sem pausa ↓</div>';
  return html;
}

function blockCard(state, liftKey, block) {
  const rows = block.exercises.map((exercise, i) => exerciseRow(state, liftKey, block, exercise, i)).join("");
  const label = esc(`${LIFTS[liftKey].title} · bloco ${block.number}`);
  return `<div class="card"><div class="row sp"><span class="meth ${METHOD_CLASS[block.method]}">BLOCO ${String(block.number).padStart(2, "0")} · ${esc(block.method)}</span>
    <button class="rest" data-act="rest" data-s="${block.rest.seconds}" data-l="${label}">⏱ ${block.rest.label}</button></div>${rows}</div>`;
}

export function liftView(state, ui) {
  const key = ui.lift;
  const lift = LIFTS[key];
  const progress = liftProgress(state.week, key);
  const tabs = LIFT_KEYS.map((k) => `<button class="${k === key ? "on" : ""}" data-act="selectLift" data-v="${k}">${k}</button>`).join("");
  const done = isItemDone(state.week, { type: "lift", key });
  return `<h2>Musculação · 4× por semana</h2><div class="seg">${tabs}</div>
    <div class="card"><h3>${lift.title} · ${esc(lift.focus)}</h3>${progressBar(progress.percent)}
    <div class="muted">${progress.done} de ${progress.total} exercícios · toque nos círculos para marcar cada série e use o ⏱ para o descanso</div></div>
    ${lift.blocks.map((b) => blockCard(state, key, b)).join("")}
    ${doneButton(doneKey({ type: "lift", key }), done, "✓ Treino concluído", `Concluir ${lift.title}`)}`;
}
