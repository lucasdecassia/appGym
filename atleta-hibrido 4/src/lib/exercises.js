import { LIFTS } from "../data/plan.js";

export const exerciseId = (liftKey, block, index) => `${liftKey}${block.number}-${index}`;

/** Exercícios sem séries (aquecimento, meta de reps) valem um único "feito". */
export const setsNeeded = (exercise) => exercise.sets || 1;

export const isExerciseDone = (week, id, exercise) => (week.sets[id] || 0) >= setsNeeded(exercise);

/** Tocar no círculo `index`: se já era o último marcado, desmarca; senão marca até ele. */
export const nextSetCount = (current, index) => (current === index + 1 ? index : index + 1);

export function liftProgress(week, liftKey) {
  let done = 0;
  let total = 0;
  for (const block of LIFTS[liftKey].blocks) {
    block.exercises.forEach((exercise, index) => {
      total += 1;
      if (isExerciseDone(week, exerciseId(liftKey, block, index), exercise)) done += 1;
    });
  }
  return { done, total, percent: total ? Math.round((done / total) * 100) : 0 };
}

/** id → { name, liftKey, liftTitle } para todos os exercícios com séries. */
export function exerciseIndex() {
  const index = new Map();
  for (const [liftKey, lift] of Object.entries(LIFTS)) {
    for (const block of lift.blocks) {
      block.exercises.forEach((exercise, i) => index.set(exerciseId(liftKey, block, i), { name: exercise.name, liftKey, liftTitle: lift.title, sets: exercise.sets || 0 }));
    }
  }
  return index;
}

/** Guarda a carga do dia (uma por exercício/dia). `kg` nulo remove o registro do dia. */
export function recordLoad(history, { date, id, kg }) {
  const rest = history.filter((h) => !(h.date === date && h.id === id));
  return Number.isFinite(kg) ? [...rest, { date, id, kg }] : rest;
}

export function personalRecords(history, limit = 5) {
  const index = exerciseIndex();
  const best = new Map();
  for (const h of history) {
    const current = best.get(h.id);
    if (!current || h.kg > current.kg || (h.kg === current.kg && h.date < current.date)) best.set(h.id, h);
  }
  return [...best.values()]
    .filter((h) => index.has(h.id))
    .sort((a, b) => b.kg - a.kg)
    .slice(0, limit)
    .map((h) => ({ id: h.id, name: index.get(h.id).name, kg: h.kg, date: h.date }));
}

/** "4 séries × 15 reps", "4 séries até a falha", "4 séries · reps 15-12-10-8" — sem símbolos que exijam explicação. */
export function formatSets(exercise) {
  if (!exercise.sets) return "";
  const n = `${exercise.sets} séries`;
  const reps = String(exercise.reps ?? "").trim();
  if (/^\d+$/.test(reps)) return `${n} × ${reps} reps`;
  if (/^\d+\s*min$/i.test(reps)) return `${n} × ${reps}`;
  if (/falha/i.test(reps)) return `${n} até a falha`;
  return `${n} · reps ${reps}`;
}
