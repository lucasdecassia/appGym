import { addDays, lastDays, weekStartKey, formatShortDate } from "./dates.js";
import { weeklyLoad } from "./load.js";
import { plannedVsRealized } from "./logs.js";
import { personalRecords } from "./exercises.js";
import { totalsPerDay as nutritionPerDay } from "./nutrition.js";
import { totalsPerDay as hydrationPerDay } from "./hydration.js";
import { perNight } from "./sleep.js";

const round1 = (x) => Math.round(x * 10) / 10;
const sum = (xs) => xs.reduce((a, b) => a + b, 0);

/** Monta as séries do painel só com o que foi registrado — lacunas ficam null, nada é inferido. */
export function buildDashboard(state, today) {
  const thisWeek = weekStartKey(today);
  const done = state.logs.filter((l) => l.done);
  const weeks = Array.from({ length: 8 }, (_, i) => addDays(thisWeek, (i - 7) * 7)).map((start) => {
    const dates = Array.from({ length: 7 }, (_, i) => addDays(start, i));
    const logs = done.filter((l) => dates.includes(l.date));
    const runs = logs.filter((l) => l.kind === "run");
    const kms = runs.map((r) => r.km).filter((v) => v > 0);
    const mins = runs.map((r) => r.durationMin).filter((v) => v > 0);
    const load = weeklyLoad(done, dates);
    return {
      start, label: formatShortDate(start),
      runKm: kms.length ? round1(sum(kms)) : null,
      runMin: mins.length ? sum(mins) : null,
      lifts: logs.length ? logs.filter((l) => l.kind === "lift").length : null,
      load: load > 0 ? load : null,
      sessions: logs.length,
    };
  });
  const days = lastDays(today, 7);
  const rpe = done.filter((l) => l.rpe > 0).sort((a, b) => a.date.localeCompare(b.date)).slice(-12).map((l) => ({ label: formatShortDate(l.date), value: l.rpe }));
  const body = [...state.body].sort((a, b) => a.date.localeCompare(b.date)).slice(-12).map((b) => ({ label: formatShortDate(b.date), value: b.kg }));
  const kmList = done.filter((l) => l.kind === "run" && l.km > 0).map((l) => l.km);
  return {
    weeks,
    planVsReal: plannedVsRealized(state.schedule, done, thisWeek),
    days: days.map(formatShortDate),
    hydration: hydrationPerDay(state.hydration.entries, days).map((d) => d.ml),
    sleep: perNight(state.sleep, days).map((n) => (n.minutes == null ? null : round1(n.minutes / 60))),
    kcal: nutritionPerDay(state.nutrition.entries, days).map((d) => (d.hasData ? d.kcal : null)),
    protein: nutritionPerDay(state.nutrition.entries, days).map((d) => (d.hasData ? d.protein : null)),
    rpe,
    body,
    records: personalRecords(state.loadHistory),
    milestones: {
      totalSessions: done.length,
      totalRunKm: kmList.length ? round1(sum(kmList)) : null,
      longestRunKm: kmList.length ? Math.max(...kmList) : null,
    },
  };
}
