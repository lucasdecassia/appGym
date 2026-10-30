import { ZONES, RUNS, RUN_KEYS, LIFTS, LIFT_KEYS, DAYS, GLOSSARY } from "../data/plan.js";
import { maxHeartRate, zoneLabel } from "../lib/heartRate.js";
import { estimateOneRepMax, loadForReps, isReliable, TARGET_REPS } from "../lib/onerm.js";
import { esc, zoneBadge } from "../components/html.js";

const selected = (cond) => (cond ? " selected" : "");

export function oneRepMaxResult(weight, reps) {
  const rm = estimateOneRepMax(weight, reps);
  if (rm == null) return "Informe carga e repetições (ideal entre 6 e 12) para ver o 1RM estimado e as cargas-alvo.";
  const rows = TARGET_REPS.map((n) => `<tr><td>${n} reps</td><td><b>${loadForReps(rm, n)} kg</b></td></tr>`).join("");
  const warning = isReliable(reps) ? "" : '<div class="note">Atenção: a estimativa é mais confiável entre 6 e 12 repetições.</div>';
  return `<div class="row sp"><span>1RM estimado</span><span class="big">${rm} kg</span></div><table><tr><th>Reps</th><th>Carga-alvo</th></tr>${rows}</table>${warning}`;
}

function heartRateCard(state) {
  const p = state.profile;
  const zones = ZONES.map((z) => `<tr><td>${zoneBadge(z.id)} <span class="muted">${esc(z.name)}</span></td><td>${Math.round(z.min * 100)}–${Math.round(z.max * 100)}</td><td><b>${zoneLabel(p, z.id).replace(" bpm", "")}</b></td></tr>`).join("");
  return `<div class="card"><h3>❤️ FCmáx e zonas</h3>
    <div class="grid2"><div><label class="f">Idade</label><input class="in" type="number" inputmode="numeric" min="10" max="90" value="${esc(p.age)}" data-profile="age"></div>
    <div><label class="f">Fórmula</label><select class="in" data-profile="formula"><option value="tanaka"${selected(p.formula === "tanaka")}>Tanaka (208 − 0,7×idade)</option><option value="haskell"${selected(p.formula === "haskell")}>Haskell e Fox (220 − idade)</option></select></div></div>
    <label class="f">FCmáx medida (opcional — substitui a fórmula)</label><input class="in" type="number" inputmode="numeric" placeholder="ex.: 190" value="${p.measured ? esc(p.measured) : ""}" data-profile="measured">
    <div class="row sp" style="margin:12px 0 4px"><span class="muted">FCmáx usada</span><span class="big">${maxHeartRate(p)} bpm</span></div>
    <table><tr><th>Zona</th><th>%</th><th>bpm</th></tr>${zones}</table>
    <div class="note">Faixas % do texto do material. A calculadora online do Time Híbrido pode mostrar faixas um pouco diferentes; se preferir, use ela e digite sua FCmáx medida acima.</div></div>`;
}

function scheduleCard(state) {
  const rows = DAYS.map((day, i) => {
    const d = state.schedule[i] || {};
    const runs = RUN_KEYS.map((k) => `<option value="${k}"${selected(d.run === k)}>${esc(`${RUNS[k].day} · ${RUNS[k].name.split(" — ")[0]}`)}</option>`).join("");
    const lifts = LIFT_KEYS.map((k) => `<option value="${k}"${selected(d.lift === k)}>${LIFTS[k].title}</option>`).join("");
    return `<div class="sched"><b>${day.slice(0, 3)}</b>
      <select class="in" data-sched="${i}:run"><option value="">Sem corrida</option>${runs}</select>
      <select class="in" data-sched="${i}:lift"><option value="">Sem musculação</option>${lifts}</select></div>`;
  }).join("");
  return `<div class="card"><h3>📅 Semana-tipo</h3><div class="muted" style="margin-bottom:8px">A distribuição da musculação é uma sugestão (separa pernas dos tiros). Troque como preferir.</div>${rows}
    <button class="btn sec small" data-act="resetSchedule" style="margin-top:6px">Restaurar sugestão</button></div>`;
}

export function toolsView(state) {
  const glossary = GLOSSARY.map(([term, text]) => `<dt>${esc(term)}</dt><dd>${esc(text)}</dd>`).join("");
  return `<h2>Ferramentas</h2>${heartRateCard(state)}
    <div class="card"><h3>🏋️ Calculadora de cargas (1RM)</h3>
      <div class="grid2"><div><label class="f">Carga testada (kg)</label><input class="in" type="number" inputmode="decimal" step="0.5" min="0" id="rm-weight" data-rm></div>
      <div><label class="f">Reps feitas</label><input class="in" type="number" inputmode="numeric" min="1" max="30" id="rm-reps" data-rm></div></div>
      <div id="rm-result" class="muted" style="margin-top:12px">${oneRepMaxResult(0, 0)}</div>
      <div class="note">Fórmula de Epley (estimativa — não é a calculadora oficial). Com halteres, use o peso de UM halter. Não teste carga máxima real; prefira séries submáximas com boa técnica.</div></div>
    ${scheduleCard(state)}
    <div class="card"><h3>📖 Glossário de métodos</h3><dl style="margin:0">${glossary}</dl>
      <div class="note">Definições gerais; em caso de dúvida vale o vídeo explicativo do material original.</div></div>
    <div class="card"><h3>💾 Seus dados</h3><div class="muted" style="margin:6px 0 10px">Tudo fica salvo neste aparelho. Para trocar de celular ou se proteger de limpeza do navegador, exporte um backup e importe no outro aparelho.</div>
      <div class="row"><button class="btn sec" data-act="exportBackup">Exportar backup</button><button class="btn sec" data-act="importBackup">Importar backup</button></div>
      <input type="file" accept="application/json,.json" id="backup-file" hidden></div>
    <div class="card"><h3>🔄 Semana</h3><div class="muted" style="margin:6px 0 10px">O progresso zera sozinho toda segunda-feira. As cargas anotadas ficam guardadas.</div>
      <button class="btn sec" data-act="resetWeek">Zerar progresso desta semana</button></div>`;
}
