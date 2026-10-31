// Registro de sessão realizada: data, duração, RPE, (corrida: distância e cadência) e observações.
import { RUNS } from "../data/plan.js";
import { logsFor } from "../lib/logs.js";
import { runKm, formatKm } from "../lib/runStats.js";
import { formatShortDate } from "../lib/dates.js";
import { isItemDone } from "../lib/progress.js";
import { field, select, textarea, formAlert, hasErrors, rpeOptions } from "./forms.js";
import { esc } from "./html.js";

function lastLogLine(state, kind, key) {
  const last = logsFor(state.logs, kind, key)[0];
  if (!last) return '<div class="muted">Nenhum registro ainda.</div>';
  const parts = [formatShortDate(last.date)];
  if (last.km) parts.push(`${formatKm(last.km)} km`);
  if (last.durationMin) parts.push(`${last.durationMin} min`);
  if (last.rpe) parts.push(`RPE ${last.rpe}`);
  if (last.cadenceAvg) parts.push(`${last.cadenceAvg} spm`);
  let line = `Último registro: ${parts.join(" · ")}`;
  if (kind === "run" && last.km) line += ` — planejado ${formatKm(runKm(RUNS[key]))} km, realizado ${formatKm(last.km)} km`;
  return `<div class="muted">${esc(line)}</div>`;
}

export function sessionLogForm(state, ui, kind, key, today) {
  const form = `log-${kind}-${key}`;
  const done = isItemDone(state.week, { type: kind, key });
  const runFields = kind === "run"
    ? `<div class="grid3">${field(ui, form, "km", "Distância (km)", { attrs: 'inputmode="decimal"' })}${field(ui, form, "cadenceAvg", "Cadência média (spm)", { attrs: 'inputmode="numeric"' })}${field(ui, form, "cadenceMax", "Cadência máx. (spm)", { attrs: 'inputmode="numeric"' })}</div>
       <div class="note">Cadência = passos por minuto (os dois pés). Não existe valor ideal único: compare com o seu próprio histórico, pace e terreno, e ajuste só aos poucos.</div>`
    : "";
  return `<details class="inner"${hasErrors(ui, form) ? " open" : ""}><summary>${done ? "Editar registro da sessão" : "Registrar sessão realizada"}</summary>
    <div data-form="${form}" data-kind="${kind}" data-key="${key}">${formAlert(ui, form)}
      <div class="grid2">${field(ui, form, "date", "Data", { type: "date", fallback: today, attrs: `max="${today}"` })}${field(ui, form, "durationMin", "Duração (min)", { attrs: 'inputmode="numeric"' })}</div>
      ${runFields}
      ${select(ui, form, "rpe", "RPE — esforço percebido (1 muito leve · 10 máximo)", rpeOptions)}
      ${textarea(ui, form, "notes", "Observações", { attrs: 'maxlength="500"' })}
      <div style="margin-top:10px"><button class="btn" data-act="saveLog">Salvar e concluir</button></div>
    </div>
    ${done ? `<div style="margin-top:8px"><button class="btn sec small" data-act="done" data-v="${kind}-${key}">Desmarcar conclusão</button></div>` : ""}
    <div style="margin-top:8px">${lastLogLine(state, kind, key)}</div></details>`;
}
