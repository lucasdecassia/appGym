import { isValidDateKey, isValidTime, timeToMinutes } from "./dates.js";
import { parseNumber } from "./nutrition.js";

export const REFERENCE_MINUTES = 7 * 60; // referência populacional para adultos, não garantia individual

/** Duração entre dormir e acordar, atravessando a meia-noite. Iguais = inválido. */
export function sleepMinutes(bed, wake) {
  if (!isValidTime(bed) || !isValidTime(wake)) return null;
  const diff = (timeToMinutes(wake) - timeToMinutes(bed) + 1440) % 1440;
  return diff === 0 ? null : diff;
}

export function formatDuration(minutes) {
  if (minutes == null) return "—";
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, "0")}`;
}

const scale = (raw, label, errors, key, optional = true) => {
  const n = parseNumber(raw);
  if (n === null) { if (!optional) errors[key] = `${label} é obrigatório.`; return null; }
  if (Number.isNaN(n) || !Number.isInteger(n) || n < 1 || n > 5) { errors[key] = `${label}: use de 1 a 5.`; return null; }
  return n;
};

export function validateSleep(input) {
  const errors = {};
  if (!isValidDateKey(input.date)) errors.date = "Data inválida.";
  const minutes = sleepMinutes(input.bed, input.wake);
  if (!isValidTime(input.bed)) errors.bed = "Horário de dormir inválido.";
  if (!isValidTime(input.wake)) errors.wake = "Horário de acordar inválido.";
  if (!errors.bed && !errors.wake && minutes == null) errors.wake = "Dormir e acordar não podem ser iguais.";
  const quality = scale(input.quality, "Qualidade", errors, "quality", false);
  const feeling = scale(input.feeling, "Sensação ao acordar", errors, "feeling");
  const fatigue = scale(input.fatigue, "Fadiga", errors, "fatigue");
  const soreness = scale(input.soreness, "Dor muscular", errors, "soreness");
  const notes = String(input.notes ?? "").trim();
  if (notes.length > 300) errors.notes = "Observações com no máximo 300 caracteres.";
  if (Object.keys(errors).length) return { ok: false, errors, value: null };
  return { ok: true, errors, value: { date: input.date, bed: input.bed, wake: input.wake, minutes, quality, feeling, fatigue, soreness, restDay: Boolean(input.restDay), notes } };
}

const avg = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

function stdDev(xs) {
  if (xs.length < 2) return null;
  const mean = avg(xs);
  return Math.sqrt(xs.reduce((s, x) => s + (x - mean) ** 2, 0) / xs.length);
}

/** Horário de dormir em minutos desde as 12:00 (para que 23:30 e 00:30 fiquem próximos). */
const bedOffset = (bed) => (timeToMinutes(bed) + 720) % 1440;

export function weekSummary(sleepEntries, dates) {
  const week = sleepEntries.filter((e) => dates.includes(e.date));
  const avgMinutes = avg(week.map((e) => e.minutes));
  const regularity = stdDev(week.map((e) => bedOffset(e.bed)));
  return {
    nights: week.length,
    avgMinutes: avgMinutes == null ? null : Math.round(avgMinutes),
    regularityMinutes: regularity == null ? null : Math.round(regularity),
    belowReference: avgMinutes != null && avgMinutes < REFERENCE_MINUTES,
    avgQuality: week.length ? Math.round(avg(week.map((e) => e.quality)) * 10) / 10 : null,
    restDays: week.filter((e) => e.restDay).length,
  };
}

export const perNight = (sleepEntries, dates) => dates.map((date) => {
  const e = sleepEntries.find((x) => x.date === date);
  return { date, minutes: e ? e.minutes : null, fatigue: e ? e.fatigue : null };
});
