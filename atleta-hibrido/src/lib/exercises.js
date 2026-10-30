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
