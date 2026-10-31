import { DAYS, MONTHS } from "../data/plan.js";
import { MEALS, UNITS, OBJECTIVES, dayTotals, entriesByMeal, goalProgress, totalsPerDay, mifflinStJeor, bmi, proteinRange, kcalGoalWarning } from "../lib/nutrition.js";
import { CONTEXTS, QUICK_AMOUNTS, dayTotal, byContext, progress, totalsPerDay as waterPerDay } from "../lib/hydration.js";
import { periodDays, formatLongDate, formatShortDate, lastDays } from "../lib/dates.js";
import { field, select, checkbox, formAlert, hasErrors } from "../components/forms.js";
import { barChart } from "../components/charts.js";
import { esc, progressBar } from "../components/html.js";

const num = (n) => String(n).replace(".", ",");
const GOAL_LABEL = { kcal: "Calorias (kcal)", protein: "Proteína (g)", carbs: "Carboidratos (g)", fat: "Gorduras (g)" };

function references(state) {
  const p = state.profile;
  const bmr = mifflinStJeor({ sex: p.sex, weightKg: p.weightKg, heightCm: p.heightCm, age: p.age });
  if (bmr == null) {
    return '<div class="banner">Para ver estimativas de referência (metabolismo basal, IMC, faixa de proteína), informe altura e peso em <b>Ferramentas → Perfil</b>. Os dados ficam só neste aparelho.</div>';
  }
  const range = proteinRange(p.weightKg);
  const warning = kcalGoalWarning(state.nutrition.goals.kcal, bmr);
  return `<div class="card"><h3>Referências (estimativas, não prescrição)</h3>
    <dl style="margin:4px 0 0"><dt>Metabolismo basal (Mifflin–St Jeor)</dt><dd>≈ ${bmr.toLocaleString("pt-BR")} kcal/dia — não é meta calórica nem gasto total diário.</dd>
    <dt>IMC matemático</dt><dd>${num(bmi(p.weightKg, p.heightCm))} kg/m² — não use isoladamente para avaliar composição corporal ou saúde de atleta.</dd>
    <dt>Proteína para praticantes (1,4–2,0 g/kg)</dt><dd>${range.min}–${range.max} g/dia — referência geral; ajuste com um profissional.</dd></dl>
    ${warning ? `<div class="banner warn" role="alert" style="margin-top:8px">${esc(warning)}</div>` : ""}</div>`;
}

function summaryCard(state, date) {
  const totals = dayTotals(state.nutrition.entries, date);
  const rows = goalProgress(totals, state.nutrition.goals).map((g) => {
    const unit = g.key === "kcal" ? "kcal" : "g";
    return `<div style="margin-top:8px"><div class="row sp"><span>${GOAL_LABEL[g.key].split(" (")[0]}</span><b>${num(g.value)} ${unit}${g.goal ? ` <span class="muted">/ ${g.goal}</span>` : ""}</b></div>${g.percent != null ? progressBar(g.percent) : ""}</div>`;
  }).join("");
  const est = totals.count ? `<div class="note">${totals.estimatedCount} de ${totals.count} registros são estimativas — valores podem diferir da composição real.</div>` : "";
  return `<div class="card"><h3>Resumo do dia</h3>${totals.count ? rows : '<div class="empty" style="margin-top:8px">Nenhum alimento registrado neste dia.</div>'}${est}
    ${!Object.values(state.nutrition.goals).some(Boolean) ? '<div class="note">Sem metas definidas. Você pode criar metas abaixo, em “Metas”.</div>' : ""}</div>`;
}

function mealsList(state, date) {
  const groups = entriesByMeal(state.nutrition.entries, date);
  if (!groups.length) return "";
  return groups.map((g) => `<div class="card"><h3>${g.label}</h3>${g.items.map((e) => `<div class="item"><div class="grow"><b>${esc(e.name)}</b>${e.estimated ? ' <span class="tag">estimativa</span>' : ""}
      <div class="muted">${num(e.qty)} ${esc(e.unit)}${e.time ? ` · ${e.time}` : ""} · ${e.kcal ?? "—"} kcal · P ${e.protein ?? "—"} · C ${e.carbs ?? "—"} · G ${e.fat ?? "—"}</div></div>
      <button class="btn sec small" data-act="favoriteFood" data-id="${e.id}" aria-label="Favoritar ${esc(e.name)}">★</button>
      <button class="btn danger small" data-act="deleteEntry" data-coll="nutrition" data-id="${e.id}" aria-label="Excluir ${esc(e.name)}">Excluir</button></div>`).join("")}</div>`).join("");
}

function foodForm(state, ui, date) {
  const f = "food";
  const favs = state.nutrition.favorites.length
    ? `<div style="margin-bottom:8px"><div class="muted" style="margin-bottom:6px">Favoritos (toque para preencher):</div>${state.nutrition.favorites.map((x) => `<span class="fav"><button class="btn sec small" data-act="useFavorite" data-id="${x.id}">${esc(x.name)} · ${num(x.qty)} ${esc(x.unit)}</button><button class="btn danger small" data-act="deleteFavorite" data-id="${x.id}" aria-label="Remover favorito ${esc(x.name)}">✕</button></span>`).join("")}</div>`
    : "";
  return `<details class="card"${ui.foodOpen || hasErrors(ui, f) ? " open" : ""}><summary><h3>+ Adicionar alimento</h3></summary>${favs}
    <div data-form="${f}" data-date="${date}">${formAlert(ui, f)}
      <div class="grid2">${select(ui, f, "meal", "Refeição", MEALS, { fallback: "lunch" })}${field(ui, f, "time", "Horário", { type: "time" })}</div>
      ${field(ui, f, "name", "Alimento", { attrs: 'maxlength="80" autocomplete="off"' })}
      <div class="grid2">${field(ui, f, "qty", "Porção", { attrs: 'inputmode="decimal"' })}${select(ui, f, "unit", "Unidade", UNITS.map((u) => ({ id: u, label: u })), { fallback: "g" })}</div>
      <div class="grid2">${field(ui, f, "kcal", "Calorias (kcal)", { attrs: 'inputmode="decimal"' })}${field(ui, f, "protein", "Proteína (g)", { attrs: 'inputmode="decimal"' })}
      ${field(ui, f, "carbs", "Carboidratos (g)", { attrs: 'inputmode="decimal"' })}${field(ui, f, "fat", "Gorduras (g)", { attrs: 'inputmode="decimal"' })}</div>
      ${field(ui, f, "fiber", "Fibra (g) — opcional", { attrs: 'inputmode="decimal"' })}
      ${checkbox(ui, f, "estimated", "Valores estimados (marque se não vierem de rótulo/tabela confiável)", { fallback: true })}
      <div style="margin-top:8px"><button class="btn" data-act="saveFood">Adicionar</button></div></div></details>`;
}

function goalsForm(state, ui) {
  const f = "goals";
  const g = state.nutrition.goals;
  const fields = Object.keys(GOAL_LABEL).map((k) => field(ui, f, k, GOAL_LABEL[k], { fallback: g[k] ?? "", attrs: 'inputmode="numeric"' })).join("");
  const obj = OBJECTIVES.find((o) => o.id === state.profile.objective);
  return `<details class="card"${hasErrors(ui, f) ? " open" : ""}><summary><h3>Metas</h3></summary>
    <div class="muted" style="margin:6px 0">Deixe em branco para não ter meta. Antes de definir calorias, considere: objetivo (${obj && obj.id ? esc(obj.label) : "defina em Ferramentas → Perfil"}), frequência e intensidade dos treinos, rotina fora do treino, restrições alimentares e se há acompanhamento profissional. Evite déficits agressivos e dietas extremas.</div>
    <div data-form="${f}">${formAlert(ui, f)}<div class="grid2">${fields}</div><div style="margin-top:10px"><button class="btn" data-act="saveGoals">Salvar metas</button></div></div></details>`;
}

function history(state, ui, date) {
  const period = ui.nutriPeriod;
  const dates = periodDays(date, period);
  const rows = totalsPerDay(state.nutrition.entries, dates);
  const withData = rows.filter((r) => r.hasData);
  const avg = (key) => (withData.length ? Math.round(withData.reduce((s, r) => s + r[key], 0) / withData.length) : null);
  const seg = [["day", "Dia"], ["week", "Semana"], ["month", "Mês"]].map(([id, l]) => `<button class="${id === period ? "on" : ""}" data-act="nutriPeriod" data-v="${id}" aria-pressed="${id === period}">${l}</button>`).join("");
  const chart = period === "day" ? "" : barChart({ id: "kcal", title: "Calorias registradas", unit: "kcal", period: period === "week" ? "semana selecionada" : "mês selecionado", source: "seus lançamentos (inclui estimativas)", points: rows.map((r) => ({ label: formatShortDate(r.date), value: r.hasData ? r.kcal : null })) });
  const table = withData.length
    ? `<table><tr><th>Dia</th><th>kcal</th><th>P</th><th>C</th><th>G</th></tr>${withData.map((r) => `<tr><td>${formatShortDate(r.date)}</td><td>${r.kcal}</td><td>${r.protein}</td><td>${r.carbs}</td><td>${r.fat}</td></tr>`).join("")}</table>
       <div class="note">Média dos ${withData.length} dia(s) com registro: ${avg("kcal")} kcal · P ${avg("protein")} g · C ${avg("carbs")} g · G ${avg("fat")} g. Dias sem registro não entram na média.</div>`
    : '<div class="empty">Sem registros neste período.</div>';
  return `<div class="card"><h3>Histórico</h3><div class="seg" style="margin-top:8px" role="group" aria-label="Período">${seg}</div>${chart}${table}</div>`;
}

export function diaryView(state, ui, today) {
  const date = ui.date || today;
  const dayNav = `<div class="row sp" style="margin-bottom:12px"><button class="btn sec small" data-act="shiftDay" data-v="-1" aria-label="Dia anterior">‹</button>
    <div style="text-align:center"><b>${formatLongDate(date, DAYS, MONTHS)}</b>${date === today ? '<div class="muted">hoje</div>' : ""}</div>
    <button class="btn sec small" data-act="shiftDay" data-v="1" aria-label="Próximo dia"${date >= today ? " disabled" : ""}>›</button></div>`;
  return `${dayNav}${summaryCard(state, date)}${mealsList(state, date)}${foodForm(state, { ...ui, foodOpen: ui.foodOpen }, date)}${goalsForm(state, ui)}${references(state)}${history(state, ui, date)}
    <div class="card"><h3>Exportar</h3><div class="row" style="margin-top:8px"><button class="btn sec" data-act="exportCsv" data-v="nutrition">CSV</button><button class="btn sec" data-act="exportJson">Backup JSON</button></div></div>`;
}

export function waterView(state, ui, today) {
  const f = "water";
  const date = ui.date || today;
  const entries = state.hydration.entries;
  const total = dayTotal(entries, date);
  const goal = state.hydration.goalMl;
  const pct = progress(total, goal);
  const days = lastDays(today, 7);
  const list = entries.filter((e) => e.date === date).sort((a, b) => (a.time || "").localeCompare(b.time || ""));
  const ctxLabel = (id) => CONTEXTS.find((c) => c.id === id)?.label ?? id;
  return `<div class="card"><div class="row sp"><div><div class="muted">${formatLongDate(date, DAYS, MONTHS)}</div><h3>Água registrada</h3></div><div class="big">${total} ml</div></div>
    ${pct != null ? `${progressBar(pct)}<div class="muted">${pct}% da meta de ${goal} ml</div>` : '<div class="note">Sem meta definida — defina abaixo se quiser acompanhar o progresso.</div>'}
    ${byContext(entries, date).length ? `<div class="note">${byContext(entries, date).map((c) => `${c.label}: ${c.ml} ml`).join(" · ")}</div>` : ""}</div>
    <div class="card"><h3>Registrar</h3><div data-form="${f}" data-date="${date}">${formAlert(ui, f)}
      <div class="grid2">${select(ui, f, "context", "Quando", CONTEXTS, { fallback: "day" })}${field(ui, f, "time", "Horário (opcional)", { type: "time" })}</div>
      <div class="row" style="margin:12px 0 4px;flex-wrap:wrap">${QUICK_AMOUNTS.map((ml) => `<button class="btn sec small" data-act="addWater" data-ml="${ml}">+${ml} ml</button>`).join("")}</div>
      <div class="grid2" style="align-items:end">${field(ui, f, "ml", "Outro volume (ml)", { attrs: 'inputmode="numeric"' })}<button class="btn" data-act="addWater">Adicionar</button></div></div>
      <div class="note">Só água entra na soma; outros líquidos e a água dos alimentos não são contados.</div></div>
    ${list.length ? `<div class="card"><h3>Lançamentos do dia</h3>${list.map((e) => `<div class="item"><div class="grow"><b>${e.ml} ml</b><div class="muted">${ctxLabel(e.context)}${e.time ? ` · ${e.time}` : ""}</div></div><button class="btn danger small" data-act="deleteEntry" data-coll="hydration" data-id="${e.id}" aria-label="Excluir ${e.ml} ml">Excluir</button></div>`).join("")}</div>` : ""}
    <div class="card">${barChart({ id: "water", title: "Água por dia", unit: "ml", period: "últimos 7 dias", source: "seus lançamentos", goal: goal || null, points: waterPerDay(entries, days).map((d) => ({ label: formatShortDate(d.date), value: d.ml })) })}</div>
    <details class="card"${hasErrors(ui, "waterGoal") ? " open" : ""}><summary><h3>Meta e orientações</h3></summary><div data-form="waterGoal">${formAlert(ui, "waterGoal")}
      ${field(ui, "waterGoal", "waterMl", "Meta diária (ml) — vazio = sem meta", { fallback: goal ?? "", attrs: 'inputmode="numeric"' })}<div style="margin-top:10px"><button class="btn" data-act="saveWaterGoal">Salvar meta</button></div></div>
      <div class="note">Não há um número de litros válido para todos: a necessidade varia com calor, duração, suor e modalidade. Evite tanto a desidratação quanto o excesso de água.</div>
      <div class="note">Em sessões longas ou quentes, considere repor eletrólitos/sódio conforme o suor e a duração. Doses individuais exigem avaliação profissional.</div></details>
    <div class="card"><div class="row"><button class="btn sec" data-act="exportCsv" data-v="hydration">Exportar CSV</button></div></div>`;
}

export function nutritionView(state, ui, today) {
  const seg = [["diary", "Diário alimentar"], ["water", "Hidratação"]].map(([id, l]) => `<button class="${id === ui.nutriSeg ? "on" : ""}" data-act="nutriSeg" data-v="${id}" aria-pressed="${id === ui.nutriSeg}">${l}</button>`).join("");
  return `<h2>Nutrição</h2><div class="seg" role="group" aria-label="Seção">${seg}</div>${ui.nutriSeg === "water" ? waterView(state, ui, today) : diaryView(state, ui, today)}`;
}
