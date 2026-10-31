export const stepKm = (s) => (s.unit === "km" ? s.reps * s.value : s.unit === "m" ? (s.reps * s.value) / 1000 : 0);
export const stepMinutes = (s) => (s.unit === "min" ? s.reps * s.value : 0);
export const runKm = (run) => run.steps.reduce((sum, s) => sum + stepKm(s), 0);
export const runMinutes = (run) => run.steps.reduce((sum, s) => sum + stepMinutes(s), 0);

export function formatKm(km) {
  return String(Math.round(km * 10) / 10).replace(".", ",");
}

export function formatStepVolume(s) {
  const prefix = s.reps > 1 ? `${s.reps}× ` : "";
  return `${prefix}${s.value} ${s.unit}`;
}
