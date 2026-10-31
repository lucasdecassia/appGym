import { RUNS, LIFTS } from "../data/plan.js";
import { isValidDateKey, addDays } from "./dates.js";
import { parseNumber } from "./nutrition.js";
import { itemsOfDay } from "./progress.js";
import { runKm } from "./runStats.js";

function optional(raw, label, { min, max, integer = false }, errors, key) {
  const n = parseNumber(raw);
  if (n === null) return null;
  if (Number.isNaN(n) || n < min || n > max || (integer && !Number.isInteger(n))) {
    errors[key] = `${label} deve estar entre ${min} e ${max}.`;
    return null;
  }
  return n;
}

/** Valida o registro de uma sessão (corrida ou força). Todos os campos além de data/tipo são opcionais. */
export function validateLog(input) {
  const errors = {};
  if (!isValidDateKey(input.date)) errors.date = "Data inválida.";
  if (input.kind !== "run" && input.kind !== "lift") errors.kind = "Tipo inválido.";
  const exists = input.kind === "run" ? RUNS[input.key] : LIFTS[input.key];
  if (!exists) errors.key = "Sessão inexistente.";
  const durationMin = optional(input.durationMin, "Duração (min)", { min: 1, max: 600, integer: true }, errors, "durationMin");
  const rpe = optional(input.rpe, "RPE", { min: 1, max: 10, integer: true }, errors, "rpe");
  let km = null, cadenceAvg = null, cadenceMax = null;
  if (input.kind === "run") {
    km = optional(input.km, "Distância (km)", { min: 0.1, max: 100 }, errors, "km");
    cadenceAvg = optional(input.cadenceAvg, "Cadência média (spm)", { min: 60, max: 260, integer: true }, errors, "cadenceAvg");
    cadenceMax = optional(input.cadenceMax, "Cadência máxima (spm)", { min: 60, max: 260, integer: true }, errors, "cadenceMax");
    if (cadenceAvg && cadenceMax && cadenceMax < cadenceAvg) errors.cadenceMax = "A máxima não pode ser menor que a média.";
  }
  const notes = String(input.notes ?? "").trim();
  if (notes.length > 500) errors.notes = "Observações com no máximo 500 caracteres.";
  if (Object.keys(errors).length) return { ok: false, errors, value: null };
  return { ok: true, errors, value: { date: input.date, kind: input.kind, key: input.key, done: true, durationMin, rpe, km, cadenceAvg, cadenceMax, notes } };
}

/** Insere ou substitui o registro da mesma sessão no mesmo dia (preserva id e createdAt). */
export function upsertLog(logs, value, { id, now }) {
  const index = logs.findIndex((l) => l.date === value.date && l.kind === value.kind && l.key === value.key);
  if (index >= 0) {
    const next = [...logs];
    next[index] = { ...logs[index], ...value, updatedAt: now };
    return next;
  }
  return [...logs, { id, ...value, createdAt: now, updatedAt: now }];
}

export const logsFor = (logs, kind, key) => logs.filter((l) => l.kind === kind && l.key === key).sort((a, b) => b.date.localeCompare(a.date));

/** Planejado × realizado da semana. Não penaliza: só informa o que foi feito. */
export function plannedVsRealized(schedule, logs, weekStart) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  let planned = 0, realized = 0, kmPlanned = 0, kmRealized = 0, extra = 0;
  const rows = days.map((date, i) => {
    const items = itemsOfDay(schedule, i).map((item) => {
      const log = logs.find((l) => l.date === date && l.kind === item.type && l.key === item.key && l.done);
      planned += 1;
      if (log) realized += 1;
      if (item.type === "run") { kmPlanned += runKm(RUNS[item.key]); if (log?.km) kmRealized += log.km; }
      return { ...item, done: Boolean(log), log };
    });
    const unplanned = logs.filter((l) => l.date === date && l.done && !items.some((it) => it.type === l.kind && it.key === l.key));
    extra += unplanned.length;
    return { date, items, unplanned };
  });
  return { rows, planned, realized, extra, kmPlanned: Math.round(kmPlanned * 10) / 10, kmRealized: Math.round(kmRealized * 10) / 10 };
}
