// Datas de diário são chaves locais "AAAA-MM-DD"; carimbos técnicos (createdAt) são ISO em UTC.
import { mondayIndex } from "./week.js";

const pad = (n) => String(n).padStart(2, "0");

export const dateKey = (date = new Date()) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export function isValidDateKey(key) {
  if (typeof key !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(key)) return false;
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

export function parseDateKey(key) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function addDays(key, amount) {
  const d = parseDateKey(key);
  return dateKey(new Date(d.getFullYear(), d.getMonth(), d.getDate() + amount));
}

export const weekStartKey = (key) => addDays(key, -mondayIndex(parseDateKey(key)));

/** `count` datas terminando em `endKey` (da mais antiga para a mais recente). */
export const lastDays = (endKey, count) => Array.from({ length: count }, (_, i) => addDays(endKey, i - (count - 1)));

/** Datas de um período: day, week (seg–dom) ou month (mês de `key`). */
export function periodDays(key, period) {
  if (period === "day") return [key];
  if (period === "week") return Array.from({ length: 7 }, (_, i) => addDays(weekStartKey(key), i));
  const d = parseDateKey(key);
  const total = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  return Array.from({ length: total }, (_, i) => dateKey(new Date(d.getFullYear(), d.getMonth(), i + 1)));
}

export const isValidTime = (t) => typeof t === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(t);

export const timeToMinutes = (t) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));

export function formatShortDate(key) {
  const [, m, d] = key.split("-");
  return `${d}/${m}`;
}

export function formatLongDate(key, days, months) {
  const d = parseDateKey(key);
  return `${days[mondayIndex(d)]}, ${d.getDate()} de ${months[d.getMonth()]}`;
}
