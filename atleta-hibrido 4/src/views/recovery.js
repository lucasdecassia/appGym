import { DAYS, MONTHS } from "../data/plan.js";
import { lastDays, periodDays, formatShortDate, formatLongDate, addDays, weekStartKey } from "../lib/dates.js";
import { weekSummary, perNight, formatDuration, REFERENCE_MINUTES } from "../lib/sleep.js";
import { weeklyLoad, descriptiveAlerts } from "../lib/load.js";
import { bmi } from "../lib/nutrition.js";
import { field, select, textarea, checkbox, formAlert, hasErrors, scaleOptions } from "../components/forms.js";
import { barChart, lineChart } from "../components/charts.js";
import { esc } from "../components/html.js";

const num = (n) => String(n).replace(".", ",");

function weekCard(state, today) {
  const start = weekStartKey(today);
  const dates = periodDays(today, "week");
  const prev = periodDays(addDays(start, -7), "week");
  const s = weekSummary(state.sleep, dates);
  const done = state.logs.filter((l) => l.done);
  const trainingDays = new Set(done.filter((l) => dates.includes(l.date)).map((l) => l.date)).size;
  const thisLoad = weeklyLoad(done, dates);
  const lastLoad = weeklyLoad(done, prev);
  const alerts = descriptiveAlerts({ thisWeekLoad: thisLoad, lastWeekLoad: lastLoad, avgSleepMinutes: s.avgMinutes });
  const stat = (v, l) => `<div><div class="big" style="font-size:20px">${v}</div><div class="muted">${l}</div></div>`;
  return `<div class="card"><h3>Semana (seg–dom)</h3><div class="grid3" style="margin-top:8px">
    ${stat(s.nights ? formatDuration(s.avgMinutes) : "—", `média de sono (${s.nights} noite${s.nights === 1 ? "" : "s"})`)}
    ${stat(s.regularityMinutes == null ? "—" : `±${s.regularityMinutes} min`, "regularidade ao deitar")}
    ${stat(s.avgQuality ?? "—", "qualidade média (1–5)")}
    ${stat(trainingDays, "dias com treino registrado")}${stat(s.restDays, "dias de descanso marcados")}${stat(thisLoad || "—", "carga interna (min × RPE)")}</div>
    ${alerts.map((a) => `<div class="banner warn" style="margin-top:10px">${esc(a)}</div>`).join("")}
    ${alerts.length ? '<div class="note">Avisos descritivos: mostram o que os dados indicam; não são diagnóstico nem ordem para parar de treinar.</div>' : ""}
    <div class="note">Referência de sono para adultos: 7 h ou mais — referência populacional, não garantia individual de recuperação. Regularidade = variação do horário de dormir.</div></div>`;
}

function sleepForm(state, ui, today) {
  const f = "sleep";
  return `<details class="card"${hasErrors(ui, f) ? " open" : ""}><summary><h3>+ Registrar sono</h3></summary><div data-form="${f}">${formAlert(ui, f)}
    ${field(ui, f, "date", "Data em que acordou", { type: "date", fallback: today, attrs: `max="${today}"` })}
    <div class="grid2">${field(ui, f, "bed", "Dormiu às", { type: "time" })}${field(ui, f, "wake", "Acordou às", { type: "time" })}</div>
    <div class="grid2">${select(ui, f, "quality", "Qualidade (1 ruim · 5 ótima)", scaleOptions)}${select(ui, f, "feeling", "Sensação ao acordar (1–5)", scaleOptions)}
    ${select(ui, f, "fatigue", "Fadiga (1 baixa · 5 alta)", scaleOptions)}${select(ui, f, "soreness", "Dor muscular (1–5)", scaleOptions)}</div>
    ${checkbox(ui, f, "restDay", "Dia de descanso/recuperação")}${textarea(ui, f, "notes", "Observações", { attrs: 'maxlength="300"' })}
    <div style="margin-top:8px"><button class="btn" data-act="saveSleep">Salvar</button></div></div></details>`;
}

function sleepView(state, ui, today) {
  const days7 = lastDays(today, 7);
  const days14 = lastDays(today, 14);
  const recent = [...state.sleep].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7);
  return `${weekCard(state, today)}${sleepForm(state, ui, today)}
    <div class="card">${barChart({ id: "sleep", title: "Horas de sono", unit: "h", period: "últimos 7 dias", source: "seus registros", goal: REFERENCE_MINUTES / 60, decimals: 1, points: perNight(state.sleep, days7).map((n) => ({ label: formatShortDate(n.date), value: n.minutes == null ? null : Math.round((n.minutes / 60) * 10) / 10 })) })}</div>
    <div class="card">${lineChart({ id: "fatigue", title: "Fadiga percebida", unit: "1–5", period: "últimos 14 dias", source: "seus registros de sono", points: perNight(state.sleep, days14).map((n) => ({ label: formatShortDate(n.date), value: n.fatigue })) })}</div>
    ${recent.length ? `<div class="card"><h3>Últimos registros</h3>${recent.map((e) => `<div class="item"><div class="grow"><b>${formatLongDate(e.date, DAYS, MONTHS)}</b><div class="muted">${e.bed}–${e.wake} · ${formatDuration(e.minutes)} · qualidade ${e.quality}${e.fatigue ? ` · fadiga ${e.fatigue}` : ""}${e.soreness ? ` · dor ${e.soreness}` : ""}${e.restDay ? " · descanso" : ""}</div>${e.notes ? `<div class="note">${esc(e.notes)}</div>` : ""}</div>
      <button class="btn danger small" data-act="deleteEntry" data-coll="sleep" data-id="${e.id}" aria-label="Excluir registro de ${e.date}">Excluir</button></div>`).join("")}</div>` : ""}
    <div class="card"><div class="row"><button class="btn sec" data-act="exportCsv" data-v="sleep">Exportar CSV</button></div></div>`;
}

function bodyView(state, ui, today) {
  const f = "body";
  const sorted = [...state.body].sort((a, b) => a.date.localeCompare(b.date));
  const last = sorted[sorted.length - 1];
  const imc = last && bmi(last.kg, state.profile.heightCm);
  return `<div class="card"><h3>Peso corporal (opcional)</h3><div data-form="${f}">${formAlert(ui, f)}
    <div class="grid2">${field(ui, f, "date", "Data", { type: "date", fallback: today, attrs: `max="${today}"` })}${field(ui, f, "kg", "Peso (kg)", { attrs: 'inputmode="decimal"' })}</div>
    <div style="margin-top:10px"><button class="btn" data-act="saveBody">Adicionar</button></div></div>
    <div class="note">Peso varia ao longo do dia e da semana; olhe a tendência, não um valor isolado.${imc ? ` IMC matemático do último registro: ${num(imc)} kg/m² — não use isoladamente para avaliar composição corporal.` : ""}</div></div>
    <div class="card">${lineChart({ id: "body", title: "Peso corporal", unit: "kg", period: "últimos 12 registros", source: "seus registros", decimals: 1, points: sorted.slice(-12).map((b) => ({ label: formatShortDate(b.date), value: b.kg })) })}</div>
    ${sorted.length ? `<div class="card"><h3>Registros</h3>${[...sorted].reverse().slice(0, 10).map((b) => `<div class="item"><div class="grow"><b>${num(b.kg)} kg</b><div class="muted">${formatLongDate(b.date, DAYS, MONTHS)}</div></div><button class="btn danger small" data-act="deleteEntry" data-coll="body" data-id="${b.id}" aria-label="Excluir ${num(b.kg)} kg">Excluir</button></div>`).join("")}</div>` : ""}`;
}

export function recoveryView(state, ui, today) {
  const seg = [["sleep", "Sono e recuperação"], ["body", "Peso"]].map(([id, l]) => `<button class="${id === ui.recSeg ? "on" : ""}" data-act="recSeg" data-v="${id}" aria-pressed="${id === ui.recSeg}">${l}</button>`).join("");
  return `<h2>Recuperação</h2><div class="seg" role="group" aria-label="Seção">${seg}</div>${ui.recSeg === "body" ? bodyView(state, ui, today) : sleepView(state, ui, today)}`;
}
