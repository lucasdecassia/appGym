import { DEFAULT_SCHEDULE } from "../data/plan.js";
import { DEFAULT_AGE } from "./heartRate.js";
import { weekKey } from "./week.js";
import { isValidDateKey } from "./dates.js";

export const STATE_VERSION = 2;

export function emptyWeek(now = new Date()) {
  return { key: weekKey(now), done: {}, sets: {} };
}

export function defaultState(now = new Date()) {
  return {
    version: STATE_VERSION,
    // Altura e peso ficam vazios de propósito: dados pessoais são digitados pelo usuário e ficam só no aparelho.
    profile: { age: DEFAULT_AGE, formula: "tanaka", measured: null, sex: "M", heightCm: null, weightKg: null, objective: "", restrictions: "" },
    schedule: structuredClone(DEFAULT_SCHEDULE),
    loads: {},
    loadHistory: [],
    week: emptyWeek(now),
    logs: [],
    nutrition: { goals: { kcal: null, protein: null, carbs: null, fat: null }, entries: [], favorites: [] },
    hydration: { goalMl: null, entries: [] },
    sleep: [],
    body: [],
  };
}

const isObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const dated = (item) => isObject(item) && typeof item.id === "string" && isValidDateKey(item.date);
const list = (raw, predicate = dated) => (Array.isArray(raw) ? raw.filter(predicate) : []);

/** Precisa de backup antes de migrar? (estado salvo por versão anterior) */
export const needsMigration = (raw) => isObject(raw) && (Number(raw.version) || 1) < STATE_VERSION;

/** Aceita qualquer coisa vinda do storage/backup e devolve um estado v2 válido (migra versões antigas). */
export function normalizeState(raw, now = new Date()) {
  const base = defaultState(now);
  if (!isObject(raw)) return base;
  const nutrition = isObject(raw.nutrition) ? raw.nutrition : {};
  const hydration = isObject(raw.hydration) ? raw.hydration : {};
  return {
    ...base,
    profile: { ...base.profile, ...(isObject(raw.profile) ? raw.profile : {}) },
    schedule: Array.isArray(raw.schedule) && raw.schedule.length === 7 ? raw.schedule.map((d) => (isObject(d) ? d : {})) : base.schedule,
    loads: isObject(raw.loads) ? raw.loads : {},
    loadHistory: list(raw.loadHistory, (h) => isObject(h) && isValidDateKey(h.date) && typeof h.id === "string" && Number.isFinite(h.kg)),
    week: isObject(raw.week) && raw.week.key === base.week.key
      ? { key: raw.week.key, done: isObject(raw.week.done) ? raw.week.done : {}, sets: isObject(raw.week.sets) ? raw.week.sets : {} }
      : base.week, // semana nova: progresso zera, cargas ficam
    logs: list(raw.logs, (l) => dated(l) && (l.kind === "run" || l.kind === "lift")),
    nutrition: {
      goals: { ...base.nutrition.goals, ...(isObject(nutrition.goals) ? nutrition.goals : {}) },
      entries: list(nutrition.entries),
      favorites: list(nutrition.favorites, (f) => isObject(f) && typeof f.id === "string" && typeof f.name === "string"),
    },
    hydration: { goalMl: Number(hydration.goalMl) > 0 ? Number(hydration.goalMl) : null, entries: list(hydration.entries, (e) => dated(e) && Number.isFinite(e.ml)) },
    sleep: list(raw.sleep, (s) => dated(s) && Number.isFinite(s.minutes)),
    body: list(raw.body, (b) => dated(b) && Number.isFinite(b.kg)),
  };
}
