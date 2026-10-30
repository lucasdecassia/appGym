import { DEFAULT_SCHEDULE } from "../data/plan.js";
import { DEFAULT_AGE } from "./heartRate.js";
import { weekKey } from "./week.js";

export const STATE_VERSION = 1;

export function emptyWeek(now = new Date()) {
  return { key: weekKey(now), done: {}, sets: {} };
}

export function defaultState(now = new Date()) {
  return {
    version: STATE_VERSION,
    profile: { age: DEFAULT_AGE, formula: "tanaka", measured: null },
    schedule: structuredClone(DEFAULT_SCHEDULE),
    loads: {},
    week: emptyWeek(now),
  };
}

const isObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);

/** Aceita qualquer coisa vinda do storage/backup e devolve um estado válido. */
export function normalizeState(raw, now = new Date()) {
  const base = defaultState(now);
  if (!isObject(raw)) return base;
  const state = {
    ...base,
    profile: { ...base.profile, ...(isObject(raw.profile) ? raw.profile : {}) },
    schedule: Array.isArray(raw.schedule) && raw.schedule.length === 7 ? raw.schedule.map((d) => (isObject(d) ? d : {})) : base.schedule,
    loads: isObject(raw.loads) ? raw.loads : {},
    week: isObject(raw.week) && raw.week.key === base.week.key
      ? { key: raw.week.key, done: isObject(raw.week.done) ? raw.week.done : {}, sets: isObject(raw.week.sets) ? raw.week.sets : {} }
      : base.week, // semana nova: progresso zera, cargas ficam
  };
  return state;
}
