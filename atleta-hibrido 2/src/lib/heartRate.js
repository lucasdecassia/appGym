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

/**
 * Transparência sobre o método: as zonas são % da FCmáx. Só são "calibradas" se a FCmáx foi medida;
 * fórmula por idade é estimativa grosseira.
 */
export function zoneCalibration(profile = {}) {
  if (profile.measured > 0) {
    return { calibrated: true, tag: "FCmáx medida", method: "% da FCmáx medida por você" };
  }
  const formula = profile.formula === "haskell" ? "Haskell e Fox" : "Tanaka";
  return { calibrated: false, tag: "estimado · não calibrado", method: `% da FCmáx estimada por idade (${formula})` };
}
