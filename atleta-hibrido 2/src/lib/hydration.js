import { isValidDateKey, isValidTime } from "./dates.js";
import { parseNumber } from "./nutrition.js";

export const CONTEXTS = [
  { id: "day", label: "Ao longo do dia" },
  { id: "before", label: "Antes do treino" },
  { id: "during", label: "Durante o treino" },
  { id: "after", label: "Depois do treino" },
];
export const QUICK_AMOUNTS = [200, 300, 500];
export const MAX_SINGLE_ML = 3000;

export function validateHydration(input) {
  const errors = {};
  if (!isValidDateKey(input.date)) errors.date = "Data inválida.";
  const time = input.time ? String(input.time) : "";
  if (time && !isValidTime(time)) errors.time = "Horário inválido.";
  if (!CONTEXTS.some((c) => c.id === input.context)) errors.context = "Escolha o contexto.";
  const ml = parseNumber(input.ml);
  if (ml === null || Number.isNaN(ml) || !Number.isInteger(ml) || ml < 1 || ml > MAX_SINGLE_ML) errors.ml = `Informe um volume inteiro entre 1 e ${MAX_SINGLE_ML} ml.`;
  if (Object.keys(errors).length) return { ok: false, errors, value: null };
  return { ok: true, errors, value: { date: input.date, time, context: input.context, ml } };
}

export const dayTotal = (entries, date) => entries.filter((e) => e.date === date).reduce((s, e) => s + e.ml, 0);

export const byContext = (entries, date) =>
  CONTEXTS.map((c) => ({ ...c, ml: entries.filter((e) => e.date === date && e.context === c.id).reduce((s, e) => s + e.ml, 0) })).filter((c) => c.ml > 0);

export const progress = (totalMl, goalMl) => (goalMl > 0 ? Math.min(100, Math.round((totalMl / goalMl) * 100)) : null);

/** Total por data; lacuna (null) quando não há lançamento. */
export const totalsPerDay = (entries, dates) =>
  dates.map((date) => ({ date, ml: entries.some((e) => e.date === date) ? dayTotal(entries, date) : null }));
