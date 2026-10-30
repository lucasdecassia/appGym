import { ZONES } from "../data/plan.js";

export const DEFAULT_AGE = 28;

/** FCmáx em bpm: valor medido tem prioridade; senão Tanaka ou Haskell e Fox. */
export function maxHeartRate({ age, formula, measured } = {}) {
  if (measured > 0) return Math.round(measured);
  const years = Number(age) || DEFAULT_AGE;
  return Math.round(formula === "haskell" ? 220 - years : 208 - 0.7 * years);
}

export function zoneRange(maxHr, zoneId) {
  const zone = ZONES.find((z) => z.id === zoneId);
  if (!zone) throw new Error(`Zona desconhecida: ${zoneId}`);
  return { min: Math.round(maxHr * zone.min), max: Math.round(maxHr * zone.max) };
}

export function zoneLabel(profile, zoneId) {
  const { min, max } = zoneRange(maxHeartRate(profile), zoneId);
  return `${min}–${max} bpm`;
}
