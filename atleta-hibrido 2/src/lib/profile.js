import { isValidDateKey } from "./dates.js";
import { OBJECTIVES, parseNumber } from "./nutrition.js";

function range(raw, label, min, max, errors, key, { integer = false } = {}) {
  const n = parseNumber(raw);
  if (n === null) return null;
  if (Number.isNaN(n) || n < min || n > max || (integer && !Number.isInteger(n))) { errors[key] = `${label}: valor entre ${min} e ${max}.`; return null; }
  return n;
}

export function validateProfile(input) {
  const errors = {};
  const age = range(input.age, "Idade", 10, 90, errors, "age", { integer: true });
  if (age === null && !errors.age) errors.age = "Informe a idade.";
  const sex = input.sex === "F" ? "F" : input.sex === "M" ? "M" : null;
  if (!sex) errors.sex = "Escolha uma opção.";
  const heightCm = range(input.heightCm, "Altura (cm)", 100, 250, errors, "heightCm");
  const weightKg = range(input.weightKg, "Peso (kg)", 30, 300, errors, "weightKg");
  const objective = OBJECTIVES.some((o) => o.id === (input.objective ?? "")) ? input.objective ?? "" : null;
  if (objective === null) errors.objective = "Objetivo inválido.";
  const restrictions = String(input.restrictions ?? "").trim();
  if (restrictions.length > 200) errors.restrictions = "Máximo de 200 caracteres.";
  if (Object.keys(errors).length) return { ok: false, errors, value: null };
  return { ok: true, errors, value: { age, sex, heightCm, weightKg, objective, restrictions } };
}

export function validateGoals(input) {
  const errors = {};
  const value = {
    kcal: range(input.kcal, "Calorias", 800, 6000, errors, "kcal", { integer: true }),
    protein: range(input.protein, "Proteína (g)", 20, 400, errors, "protein", { integer: true }),
    carbs: range(input.carbs, "Carboidratos (g)", 20, 1000, errors, "carbs", { integer: true }),
    fat: range(input.fat, "Gorduras (g)", 10, 400, errors, "fat", { integer: true }),
    waterMl: range(input.waterMl, "Meta de água (ml)", 500, 10000, errors, "waterMl", { integer: true }),
  };
  return Object.keys(errors).length ? { ok: false, errors, value: null } : { ok: true, errors, value };
}

export function validateBodyWeight(input) {
  const errors = {};
  if (!isValidDateKey(input.date)) errors.date = "Data inválida.";
  const kg = range(input.kg, "Peso (kg)", 30, 300, errors, "kg");
  if (kg === null && !errors.kg) errors.kg = "Informe o peso.";
  return Object.keys(errors).length ? { ok: false, errors, value: null } : { ok: true, errors, value: { date: input.date, kg } };
}
