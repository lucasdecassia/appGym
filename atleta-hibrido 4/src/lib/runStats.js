export const stepKm = (s) => (s.unit === "km" ? s.reps * s.value : s.unit === "m" ? (s.reps * s.value) / 1000 : 0);
export const stepMinutes = (s) => (s.unit === "min" ? s.reps * s.value : 0);
export const runKm = (run) => run.steps.reduce((sum, s) => sum + stepKm(s), 0);
export const runMinutes = (run) => run.steps.reduce((sum, s) => sum + stepMinutes(s), 0);

export function formatKm(km) {
  return String(Math.round(km * 10) / 10).replace(".", ",");
}

const trim = (n) => String(Math.round(n * 10) / 10).replace(".", ",");

/** Total de uma etapa repetida, na unidade mais legível (1000 m ou mais vira km). */
function formatTotal(s) {
  const total = s.reps * s.value;
  if (s.unit === "m") return total >= 1000 ? `${trim(total / 1000)} km` : `${total} m`;
  return `${trim(total)} ${s.unit}`;
}

/** Volume em palavras simples: "3 vezes de 1 km (total 3 km)". Sem repetição: "5 min". */
export function formatStepVolume(s) {
  const one = `${trim(s.value)} ${s.unit}`;
  return s.reps > 1 ? `${s.reps} vezes de ${one} (total ${formatTotal(s)})` : one;
}
