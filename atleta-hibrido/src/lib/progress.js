import { LIFTS, RUNS } from "../data/plan.js";
import { runKm } from "./runStats.js";

/** Itens planejados para o dia `dayIndex`: corrida e/ou musculação. */
export function itemsOfDay(schedule, dayIndex) {
  const day = schedule[dayIndex] || {};
  const items = [];
  if (day.run && RUNS[day.run]) items.push({ type: "run", key: day.run });
  if (day.lift && LIFTS[day.lift]) items.push({ type: "lift", key: day.lift });
  return items;
}

export const doneKey = (item) => `${item.type}-${item.key}`;
export const isItemDone = (week, item) => Boolean(week.done[doneKey(item)]);

export function isDayDone(state, dayIndex) {
  const items = itemsOfDay(state.schedule, dayIndex);
  return items.length > 0 && items.every((item) => isItemDone(state.week, item));
}

export function weekStats(state) {
  let daysPlanned = 0, daysDone = 0, kmPlanned = 0, kmDone = 0;
  for (let i = 0; i < 7; i++) {
    const items = itemsOfDay(state.schedule, i);
    if (!items.length) continue;
    daysPlanned += 1;
    if (isDayDone(state, i)) daysDone += 1;
    for (const item of items) {
      if (item.type !== "run") continue;
      const km = runKm(RUNS[item.key]);
      kmPlanned += km;
      if (isItemDone(state.week, item)) kmDone += km;
    }
  }
  const percent = daysPlanned ? Math.round((daysDone / daysPlanned) * 100) : 0;
  return { daysPlanned, daysDone, kmPlanned, kmDone, percent };
}
