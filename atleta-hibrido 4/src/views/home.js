import { DAYS, DAY_INITIALS, MONTHS, RUNS, LIFTS } from "../data/plan.js";
import { mondayIndex, dateOfWeekday } from "../lib/week.js";
import { dateKey, weekStartKey } from "../lib/dates.js";
import { itemsOfDay, isItemDone, isDayDone, weekStats } from "../lib/progress.js";
import { plannedVsRealized } from "../lib/logs.js";
import { runKm, runMinutes, formatKm } from "../lib/runStats.js";
import { liftProgress } from "../lib/exercises.js";
import { dayTotals } from "../lib/nutrition.js";
import { dayTotal } from "../lib/hydration.js";
import { formatDuration } from "../lib/sleep.js";
import { esc, allZonesWithBpm, progressBar } from "../components/html.js";
import { sessionLogForm } from "../components/sessionLog.js";

function runCard(state, ui, key, today) {
  const run = RUNS[key];
  const done = isItemDone(state.week, { type: "run", key });
  return `<div class="card"><div class="row sp"><span class="pill">🏃 Corrida</span>${done ? '<span class="tag ok">concluída</span>' : ""}</div>
    <h3 style="margin-top:8px">${esc(run.name)}</h3><div class="muted">${formatKm(runKm(run))} km + ${runMinutes(run)} min de aquecimento e recuperação</div>
    <p style="margin:8px 0 0"><b>Objetivo:</b> ${esc(run.objective)}</p>
    <div class="row" style="margin-top:10px"><button class="btn sec" data-act="openRun" data-v="${key}">Ver etapas e zonas</button></div>
    ${sessionLogForm(state, ui, "run", key, today)}</div>`;
}

function liftCard(state, ui, key, today) {
  const lift = LIFTS[key];
  const progress = liftProgress(state.week, key);
  const done = isItemDone(state.week, { type: "lift", key });
  return `<div class="card"><div class="row sp"><span class="pill">🏋️ Musculação</span>${done ? '<span class="tag ok">concluído</span>' : ""}</div>
    <h3 style="margin-top:8px">${lift.title} · ${esc(lift.focus)}</h3><p style="margin:8px 0 0"><b>Objetivo:</b> ${esc(lift.objective)}</p>
    ${progressBar(progress.percent)}<div class="muted">${progress.done} de ${progress.total} exercícios feitos</div>
    <div class="row" style="margin-top:10px"><button class="btn sec" data-act="openLift" data-v="${key}">Abrir treino</button></div>
    ${sessionLogForm(state, ui, "lift", key, today)}</div>`;
}

function planVsRealCard(state, today) {
  const r = plannedVsRealized(state.schedule, state.logs.filter((l) => l.done), weekStartKey(today));
  return `<div class="card"><h3>Planejado × realizado</h3>
    <div class="muted" style="margin-top:4px">${r.realized} de ${r.planned} sessões registradas · corrida ${formatKm(r.kmRealized)} de ${formatKm(r.kmPlanned)} km planejados${r.extra ? ` · ${r.extra} sessão(ões) fora do plano` : ""}</div>
    <div class="note">Sessões sem registro não penalizam nada: o app só mostra o que você anotou (distância só conta se informada).</div></div>`;
}

function todayCard(state, today) {
  const kcal = dayTotals(state.nutrition.entries, today);
  const water = dayTotal(state.hydration.entries, today);
  const sleep = state.sleep.find((s) => s.date === today);
  return `<div class="card"><h3>Hoje em números</h3><div class="grid3" style="margin-top:8px">
    <div><div class="big" style="font-size:20px">${kcal.count ? `${kcal.kcal}` : "—"}</div><div class="muted">kcal ${kcal.count ? `· P ${kcal.protein} g` : "sem registro"}</div></div>
    <div><div class="big" style="font-size:20px">${water ? `${water}` : "—"}</div><div class="muted">ml de água</div></div>
    <div><div class="big" style="font-size:20px">${sleep ? formatDuration(sleep.minutes) : "—"}</div><div class="muted">sono da noite</div></div></div></div>`;
}

export function homeView(state, ui, now = new Date()) {
  const stats = weekStats(state);
  const today = mondayIndex(now);
  const todayKey = dateKey(now);
  let html = `<div class="card"><div class="row sp"><div><div class="muted">${DAYS[today]}, ${now.getDate()} de ${MONTHS[now.getMonth()]}</div>
    <h2 style="margin:2px 0 0">Seu progresso da semana</h2></div><div class="big" aria-label="${stats.percent}% da semana">${stats.percent}%</div></div>
    ${progressBar(stats.percent)}
    <div class="muted">${stats.daysDone} de ${stats.daysPlanned} dias concluídos · corrida ${formatKm(stats.kmDone)} / ${formatKm(stats.kmPlanned)} km</div></div>`;

  html += '<div class="strip" role="group" aria-label="Dias da semana">';
  for (let i = 0; i < 7; i++) {
    const cls = ["day", i === today ? "today" : "", i === ui.selectedDay ? "sel" : "", isDayDone(state, i) ? "ok" : ""].join(" ");
    html += `<button class="${cls}" data-act="selectDay" data-v="${i}" aria-pressed="${i === ui.selectedDay}" aria-label="${DAYS[i]} ${dateOfWeekday(i, now).getDate()}${isDayDone(state, i) ? ", concluído" : ""}"><small>${DAY_INITIALS[i]}</small><b>${dateOfWeekday(i, now).getDate()}</b><span class="dot"></span></button>`;
  }
  html += "</div>";

  const items = itemsOfDay(state.schedule, ui.selectedDay);
  html += `<h2>${DAYS[ui.selectedDay]}${ui.selectedDay === today ? " · hoje" : ""}</h2>`;
  if (!items.length) html += '<div class="card"><h3>😴 Dia de descanso</h3><p class="muted" style="margin:6px 0 0">Recuperar também é treinar. Hidrate-se, durma bem e, se quiser, faça uma mobilidade leve.</p></div>';
  for (const item of items) html += item.type === "run" ? runCard(state, ui, item.key, todayKey) : liftCard(state, ui, item.key, todayKey);

  return html + planVsRealCard(state, todayKey) + todayCard(state, todayKey)
    + '<div class="warn">Conteúdo informativo, não substitui acompanhamento profissional. Faça um check-up médico antes de iniciar e pare se sentir dor, tontura ou falta de ar anormal.</div>';
}
