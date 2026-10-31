import { ZONES, RUNS, RUN_KEYS, LIFTS, LIFT_KEYS, DAYS, GLOSSARY } from "../data/plan.js";
import { maxHeartRate, zoneCalibration } from "../lib/heartRate.js";
import { estimateOneRepMax, loadForReps, isReliable, TARGET_REPS } from "../lib/onerm.js";
import { OBJECTIVES } from "../lib/nutrition.js";
import { field, select, textarea, formAlert, hasErrors } from "../components/forms.js";
import { esc, zoneBadge, bpmText, calibrationTag } from "../components/html.js";

const selected = (cond) => (cond ? " selected" : "");

export function oneRepMaxResult(weight, reps) {
  const rm = estimateOneRepMax(weight, reps);
  if (rm == null) return "Informe carga e repetições (ideal entre 6 e 12) para ver o 1RM estimado e as cargas-alvo.";
  const rows = TARGET_REPS.map((n) => `<tr><td>${n} reps</td><td><b>${loadForReps(rm, n)} kg</b></td></tr>`).join("");
  const warning = isReliable(reps) ? "" : '<div class="note">Atenção: a estimativa é mais confiável entre 6 e 12 repetições.</div>';
  return `<div class="row sp"><span>1RM estimado</span><span class="big">${rm} kg</span></div><table><tr><th>Reps</th><th>Carga-alvo</th></tr>${rows}</table>${warning}`;
}

function profileCard(state, ui) {
  const f = "profile";
  const p = state.profile;
  return `<details class="card"${hasErrors(ui, f) ? " open" : ""}><summary><h3>👤 Perfil</h3></summary>
    <div class="muted" style="margin:6px 0">Usado em estimativas de referência. Altura e peso ficam só neste aparelho e não vêm preenchidos no app.</div>
    <div data-form="${f}">${formAlert(ui, f)}<div class="grid2">${field(ui, f, "age", "Idade", { fallback: p.age ?? "", attrs: 'inputmode="numeric"' })}
    ${select(ui, f, "sex", "Sexo (para a equação de metabolismo basal)", [{ id: "M", label: "Masculino" }, { id: "F", label: "Feminino" }], { fallback: p.sex })}
    ${field(ui, f, "heightCm", "Altura (cm)", { fallback: p.heightCm ?? "", attrs: 'inputmode="decimal"' })}${field(ui, f, "weightKg", "Peso (kg)", { fallback: p.weightKg ?? "", attrs: 'inputmode="decimal"' })}</div>
    ${select(ui, f, "objective", "Objetivo prioritário", OBJECTIVES, { fallback: p.objective })}${textarea(ui, f, "restrictions", "Restrições alimentares, alergias ou preferências", { fallback: p.restrictions, attrs: 'maxlength="200"' })}
    <div class="note">Se houver condição clínica, histórico de transtorno alimentar ou acompanhamento profissional, siga a orientação de nutricionista/médico.</div>
    <div style="margin-top:10px"><button class="btn" data-act="saveProfile">Salvar perfil</button></div></div></details>`;
}

function heartRateCard(state, ui) {
  const p = state.profile;
  const c = zoneCalibration(p);
  const zones = ZONES.map((z) => `<tr><td>${zoneBadge(z.id)}</td><td>${z.rpe}</td><td style="text-align:left">${esc(z.talk)}</td><td><b>${bpmText(p, z.id)}</b></td></tr>`).join("");
  return `<div class="card"><div class="row sp"><h3>❤️ FCmáx e zonas</h3>${calibrationTag(p)}</div>
    <div class="muted" style="margin:6px 0">Método: <b>${esc(c.method)}</b>. Fórmulas por idade são estimativas grosseiras; o ideal é medir (teste) ou usar limiares individuais.</div>
    <div data-form="hr" class="grid2"><div><label class="f" for="hr-formula">Fórmula</label><select class="in" id="hr-formula" data-hr="formula"><option value="tanaka"${selected(p.formula === "tanaka")}>Tanaka (208 − 0,7×idade)</option><option value="haskell"${selected(p.formula === "haskell")}>Haskell e Fox (220 − idade)</option></select></div>
    <div><label class="f" for="hr-measured">FCmáx medida (opcional)</label><input class="in" id="hr-measured" type="number" inputmode="numeric" placeholder="ex.: 190" value="${p.measured ? esc(p.measured) : ""}" data-hr="measured"></div></div>
    <div class="row sp" style="margin:12px 0 4px"><span class="muted">FCmáx usada</span><span class="big">${maxHeartRate(p)} bpm</span></div>
    <table><tr><th>Zona</th><th>RPE</th><th>Fala</th><th>bpm</th></tr>${zones}</table>
    <div class="note">Percentuais do material do plano (Z1 50–60 · Z2 60–70 · Z3 70–85 · Z4 85–95 · Z5 95–100 % da FCmáx); não os misture com zonas de limiar/lactato ou de reserva de FC.</div></div>`;
}

function scheduleCard(state) {
  const rows = DAYS.map((day, i) => {
    const d = state.schedule[i] || {};
    const runs = RUN_KEYS.map((k) => `<option value="${k}"${selected(d.run === k)}>${esc(`${RUNS[k].day} · ${RUNS[k].name.split(" — ")[0]}`)}</option>`).join("");
    const lifts = LIFT_KEYS.map((k) => `<option value="${k}"${selected(d.lift === k)}>${LIFTS[k].title}</option>`).join("");
    return `<div class="sched"><b>${day.slice(0, 3)}</b><select class="in" aria-label="Corrida na ${day}" data-sched="${i}:run"><option value="">Sem corrida</option>${runs}</select>
      <select class="in" aria-label="Musculação na ${day}" data-sched="${i}:lift"><option value="">Sem musculação</option>${lifts}</select></div>`;
  }).join("");
  return `<div class="card"><h3>📅 Semana-tipo</h3><div class="muted" style="margin-bottom:8px">A distribuição da musculação é uma sugestão (separa pernas dos tiros). Troque como preferir.</div>${rows}
    <button class="btn sec small" data-act="resetSchedule" style="margin-top:6px">Restaurar sugestão</button></div>`;
}

export function toolsView(state, ui = {}) {
  const glossary = GLOSSARY.map(([term, text]) => `<dt>${esc(term)}</dt><dd>${esc(text)}</dd>`).join("");
  return `<h2>Ferramentas</h2>${profileCard(state, ui)}${heartRateCard(state, ui)}
    <div class="card"><h3>🏋️ Calculadora de cargas (1RM)</h3>
      <div class="grid2"><div><label class="f" for="rm-weight">Carga testada (kg)</label><input class="in" id="rm-weight" type="number" inputmode="decimal" step="0.5" min="0" data-rm></div>
      <div><label class="f" for="rm-reps">Reps feitas</label><input class="in" id="rm-reps" type="number" inputmode="numeric" min="1" max="30" data-rm></div></div>
      <div id="rm-result" class="muted" style="margin-top:12px" aria-live="polite">${oneRepMaxResult(0, 0)}</div>
      <div class="note">Fórmula de Epley (estimativa — não é a calculadora oficial). Com halteres, use o peso de UM halter. Não teste carga máxima real; prefira séries submáximas com boa técnica.</div></div>
    ${scheduleCard(state)}
    <div class="card"><h3>📖 Glossário de métodos</h3><dl style="margin:0">${glossary}</dl><div class="note">Definições gerais; em caso de dúvida vale o vídeo explicativo do material original.</div></div>
    <div class="card"><h3>💾 Seus dados</h3><div class="muted" style="margin:6px 0 10px">Tudo fica salvo neste aparelho (armazenamento do navegador). Exporte um backup para trocar de celular ou se proteger de limpeza do navegador.</div>
      <div class="row"><button class="btn sec" data-act="exportJson">Exportar backup (JSON)</button><button class="btn sec" data-act="importBackup">Importar backup</button></div>
      <div class="row" style="margin-top:8px;flex-wrap:wrap"><button class="btn sec small" data-act="exportCsv" data-v="training">CSV treinos</button><button class="btn sec small" data-act="exportCsv" data-v="nutrition">CSV nutrição</button><button class="btn sec small" data-act="exportCsv" data-v="hydration">CSV hidratação</button><button class="btn sec small" data-act="exportCsv" data-v="sleep">CSV sono</button></div>
      <input type="file" accept="application/json,.json" id="backup-file" hidden aria-label="Arquivo de backup"></div>
    <div class="card"><h3>🔄 Semana</h3><div class="muted" style="margin:6px 0 10px">O progresso zera sozinho toda segunda-feira. As cargas anotadas e os registros ficam guardados.</div>
      <button class="btn sec" data-act="resetWeek">Zerar progresso desta semana</button></div>`;
}
