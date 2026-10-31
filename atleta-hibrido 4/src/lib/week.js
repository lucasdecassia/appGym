// Utilidades de calendário (semana ISO, segunda = 0).

export function weekKey(date = new Date()) {
  const t = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNumber = (t.getUTCDay() + 6) % 7;
  t.setUTCDate(t.getUTCDate() - dayNumber + 3); // quinta-feira da semana
  const year = t.getUTCFullYear();
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const week = 1 + Math.round(((t - jan4) / 864e5 - 3 + ((jan4.getUTCDay() + 6) % 7)) / 7);
  return `${year}-W${String(week).padStart(2, "0")}`;
}

/** Índice do dia da semana com segunda = 0 … domingo = 6. */
export function mondayIndex(date = new Date()) {
  return (date.getDay() + 6) % 7;
}

/** Data do dia `index` (segunda = 0) na semana de `today`. */
export function dateOfWeekday(index, today = new Date()) {
  const d = new Date(today);
  d.setDate(d.getDate() - mondayIndex(today) + index);
  return d;
}
