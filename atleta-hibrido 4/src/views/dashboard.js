import { formatKm } from "../lib/runStats.js";
import { formatShortDate } from "../lib/dates.js";
import { buildDashboard } from "../lib/dashboard.js";
import { barChart, lineChart } from "../components/charts.js";
import { esc } from "../components/html.js";

const SOURCE = "seus registros no app";

export function dashboardView(state, ui, today) {
  const d = buildDashboard(state, today);
  const weekPoints = (key) => d.weeks.map((w) => ({ label: w.label, value: w[key] }));
  const dayPoints = (values) => d.days.map((label, i) => ({ label, value: values[i] }));
  const m = d.milestones;
  const plan = d.planVsReal;
  const records = d.records.length
    ? `<table><tr><th>Exercício</th><th>Maior carga</th><th>Data</th></tr>${d.records.map((r) => `<tr><td>${esc(r.name)}</td><td><b>${String(r.kg).replace(".", ",")} kg</b></td><td>${formatShortDate(r.date)}</td></tr>`).join("")}</table>`
    : '<div class="empty">Anote cargas nos treinos de força para ver recordes.</div>';
  return `<h2>Painel</h2>
    <div class="banner">Os gráficos mostram só o que você registrou. Períodos sem registro aparecem como lacuna (○), nunca como zero, e nada é estimado ou pontuado automaticamente.</div>
    <div class="card"><h3>Planejado × realizado (semana atual)</h3><div class="grid3" style="margin-top:8px">
      <div><div class="big" style="font-size:22px">${plan.realized}/${plan.planned}</div><div class="muted">sessões registradas</div></div>
      <div><div class="big" style="font-size:22px">${formatKm(plan.kmRealized)}/${formatKm(plan.kmPlanned)}</div><div class="muted">km (corrida)</div></div>
      <div><div class="big" style="font-size:22px">${plan.extra}</div><div class="muted">fora do plano</div></div></div></div>
    <div class="card">${barChart({ id: "runkm", title: "Corrida por semana", unit: "km", period: "últimas 8 semanas", source: SOURCE, decimals: 1, points: weekPoints("runKm") })}</div>
    <div class="card">${barChart({ id: "runmin", title: "Duração da corrida", unit: "min", period: "últimas 8 semanas", source: SOURCE, points: weekPoints("runMin") })}</div>
    <div class="card">${barChart({ id: "lifts", title: "Sessões de força", unit: "sessões", period: "últimas 8 semanas", source: SOURCE, points: weekPoints("lifts") })}</div>
    <div class="card">${barChart({ id: "load", title: "Carga interna semanal", unit: "min × RPE", period: "últimas 8 semanas", source: "duração e RPE informados nas sessões", points: weekPoints("load") })}
      <div class="note">Soma de duração × RPE das sessões em que você informou os dois valores.</div></div>
    <div class="card">${lineChart({ id: "rpe", title: "Esforço percebido (RPE)", unit: "1–10", period: "últimos 12 registros", source: SOURCE, points: d.rpe })}</div>
    <div class="card"><h3>Recordes de carga</h3><div style="margin-top:6px">${records}</div></div>
    <div class="card">${barChart({ id: "hyd", title: "Hidratação", unit: "ml", period: "últimos 7 dias", source: SOURCE, goal: state.hydration.goalMl || null, points: dayPoints(d.hydration) })}</div>
    <div class="card">${barChart({ id: "sleep", title: "Sono", unit: "h", period: "últimos 7 dias", source: SOURCE, decimals: 1, goal: 7, points: dayPoints(d.sleep) })}<div class="note">Linha tracejada: 7 h, referência populacional para adultos.</div></div>
    <div class="card">${barChart({ id: "kcal", title: "Calorias registradas", unit: "kcal", period: "últimos 7 dias", source: `${SOURCE} (inclui estimativas)`, goal: state.nutrition.goals.kcal || null, points: dayPoints(d.kcal) })}</div>
    <div class="card">${barChart({ id: "prot", title: "Proteína registrada", unit: "g", period: "últimos 7 dias", source: `${SOURCE} (inclui estimativas)`, goal: state.nutrition.goals.protein || null, decimals: 1, points: dayPoints(d.protein) })}</div>
    <div class="card">${lineChart({ id: "weight", title: "Peso corporal", unit: "kg", period: "últimos 12 registros", source: SOURCE, decimals: 1, points: d.body })}</div>
    <div class="card"><h3>Marcos</h3><div class="grid3" style="margin-top:8px">
      <div><div class="big" style="font-size:22px">${m.totalSessions}</div><div class="muted">sessões concluídas</div></div>
      <div><div class="big" style="font-size:22px">${m.totalRunKm == null ? "—" : formatKm(m.totalRunKm)}</div><div class="muted">km registrados</div></div>
      <div><div class="big" style="font-size:22px">${m.longestRunKm == null ? "—" : formatKm(m.longestRunKm)}</div><div class="muted">maior corrida (km)</div></div></div></div>`;
}
