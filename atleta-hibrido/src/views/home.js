import { DAYS, DAY_INITIALS, MONTHS, RUNS, LIFTS } from "../data/plan.js";
import { mondayIndex, dateOfWeekday } from "../lib/week.js";
import { itemsOfDay, isItemDone, isDayDone, weekStats, doneKey } from "../lib/progress.js";
import { runKm, runMinutes, formatKm } from "../lib/runStats.js";
import { liftProgress } from "../lib/exercises.js";
import { esc, zoneWithBpm, progressBar, doneButton } from "../components/html.js";

function zoneSummary(profile, run) {
  const seen = new Set();
  return run.steps
    .filter((s) => !seen.has(s.zone) && seen.add(s.zone))
    .map((s) => zoneWithBpm(profile, s.zone))
    .join("");
}

function runCard(state, key) {
  const run = RUNS[key];
  const done = isItemDone(state.week, { type: "run", key });
  return `<div class="card"><span class="pill">🏃 Corrida</span><h3 style="margin-top:8px">${esc(run.name)}</h3>
    <div class="muted">${formatKm(runKm(run))} km + ${runMinutes(run)} min de aquecimento/recuperação</div>
    <div class="chips" style="margin:10px 0">${zoneSummary(state.profile, run)}</div>
    <div class="row"><button class="btn sec" data-act="openRun" data-v="${key}">Ver etapas</button>
    ${doneButton(doneKey({ type: "run", key }), done, "✓ Concluída", "Concluir corrida")}</div></div>`;
}

function liftCard(state, key) {
  const lift = LIFTS[key];
  const progress = liftProgress(state.week, key);
  const done = isItemDone(state.week, { type: "lift", key });
  return `<div class="card"><span class="pill">🏋️ Musculação</span><h3 style="margin-top:8px">${lift.title} · ${esc(lift.focus)}</h3>
    ${progressBar(progress.percent)}<div class="muted">${progress.done} de ${progress.total} exercícios feitos</div>
    <div class="row" style="margin-top:10px"><button class="btn sec" data-act="openLift" data-v="${key}">Abrir treino</button>
    ${doneButton(doneKey({ type: "lift", key }), done, "✓ Concluído", "Concluir treino")}</div></div>`;
}

export function homeView(state, ui, now = new Date()) {
  const stats = weekStats(state);
  const today = mondayIndex(now);
  let html = `<div class="card"><div class="row sp"><div><div class="muted">${DAYS[today]}, ${now.getDate()} de ${MONTHS[now.getMonth()]}</div>
    <h2 style="margin:2px 0 0">Seu progresso da semana</h2></div><div class="big">${stats.percent}%</div></div>
    ${progressBar(stats.percent)}
    <div class="muted">${stats.daysDone} de ${stats.daysPlanned} dias concluídos · corrida ${formatKm(stats.kmDone)} / ${formatKm(stats.kmPlanned)} km</div></div>`;

  html += '<div class="strip">';
  for (let i = 0; i < 7; i++) {
    const cls = ["day", i === today ? "today" : "", i === ui.selectedDay ? "sel" : "", isDayDone(state, i) ? "ok" : ""].join(" ");
    html += `<button class="${cls}" data-act="selectDay" data-v="${i}"><small>${DAY_INITIALS[i]}</small><b>${dateOfWeekday(i, now).getDate()}</b><span class="dot"></span></button>`;
  }
  html += "</div>";

  const items = itemsOfDay(state.schedule, ui.selectedDay);
  html += `<h2>${DAYS[ui.selectedDay]}${ui.selectedDay === today ? " · hoje" : ""}</h2>`;
  if (!items.length) {
    html += '<div class="card"><h3>😴 Dia de descanso</h3><p class="muted" style="margin:6px 0 0">Recuperar também é treinar. Hidrate-se, durma bem e, se quiser, faça uma mobilidade leve.</p></div>';
  }
  for (const item of items) html += item.type === "run" ? runCard(state, item.key) : liftCard(state, item.key);

  return html + '<div class="warn">Conteúdo informativo, não substitui acompanhamento profissional. Faça um check-up médico antes de iniciar e pare se sentir dor, tontura ou falta de ar anormal.</div>';
}
