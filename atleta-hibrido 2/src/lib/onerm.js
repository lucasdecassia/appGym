export const TARGET_REPS = [6, 8, 10, 12, 15, 20];

const round1 = (x) => Math.round(x * 10) / 10;

/** 1RM estimado pela fórmula de Epley. Retorna null se a entrada for inválida. */
export function estimateOneRepMax(weight, reps) {
  if (!(weight > 0) || !(reps > 0)) return null;
  return round1(weight * (1 + reps / 30));
}

/** Carga-alvo para `reps` repetições a partir de um 1RM. */
export function loadForReps(oneRepMax, reps) {
  return round1(oneRepMax / (1 + reps / 30));
}

/** Confiabilidade: a estimativa é melhor entre 4 e 15 repetições. */
export const isReliable = (reps) => reps >= 4 && reps <= 15;
