// Carga interna simples (sRPE): duração (min) × RPE (1–10). Descritiva, não é pontuação de prontidão.
export const LOAD_JUMP_PERCENT = 30; // referência arbitrária para destacar variação; não é limiar clínico

export const sessionLoad = (durationMin, rpe) => (durationMin > 0 && rpe > 0 ? Math.round(durationMin * rpe) : null);

export const weeklyLoad = (logs, dates) =>
  logs.filter((l) => l.done && dates.includes(l.date)).reduce((sum, l) => sum + (sessionLoad(l.durationMin, l.rpe) || 0), 0);

export function changePercent(previous, current) {
  if (!(previous > 0)) return null;
  return Math.round(((current - previous) / previous) * 100);
}

/** Alertas descritivos — informam o que os dados mostram; não decidem nem interrompem treino. */
export function descriptiveAlerts({ thisWeekLoad, lastWeekLoad, avgSleepMinutes, sleepReferenceMinutes = 420 }) {
  const alerts = [];
  const change = changePercent(lastWeekLoad, thisWeekLoad);
  if (change != null && change >= LOAD_JUMP_PERCENT) {
    alerts.push(`A carga interna desta semana (${thisWeekLoad}) é ${change}% maior que a da semana anterior (${lastWeekLoad}).`);
  }
  if (avgSleepMinutes != null && avgSleepMinutes < sleepReferenceMinutes) {
    alerts.push("A média de sono da semana ficou abaixo de 7 h, referência populacional para adultos.");
  }
  return alerts;
}
