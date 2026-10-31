import { isValidDateKey, isValidTime } from "./dates.js";

export const MEALS = [
  { id: "breakfast", label: "Café da manhã" },
  { id: "lunch", label: "Almoço" },
  { id: "dinner", label: "Jantar" },
  { id: "snack", label: "Lanche" },
  { id: "pre", label: "Pré-treino" },
  { id: "post", label: "Pós-treino" },
];
export const UNITS = ["g", "ml", "un", "porção", "colher", "xícara"];
export const OBJECTIVES = [
  { id: "", label: "Não definido" },
  { id: "fat-loss", label: "Reduzir gordura" },
  { id: "muscle", label: "Ganhar massa" },
  { id: "maintain", label: "Manter peso" },
  { id: "performance", label: "Melhorar performance" },
];

/** "" -> null; vírgula decimal aceita; inválido -> NaN. */
export function parseNumber(value) {
  if (value === "" || value == null) return null;
  const n = Number(String(value).trim().replace(",", "."));
  return Number.isFinite(n) ? n : Number.NaN;
}

const round1 = (x) => Math.round(x * 10) / 10;

function numberField(raw, label, { min, max, required = false, errors, key }) {
  const n = parseNumber(raw);
  if (n === null) {
    if (required) errors[key] = `${label} é obrigatório.`;
    return null;
  }
  if (Number.isNaN(n) || n < min || n > max) {
    errors[key] = `${label} deve estar entre ${min} e ${max}.`;
    return null;
  }
  return n;
}

/** Valida um lançamento de alimento. Devolve { ok, errors, value }. */
export function validateFood(input) {
  const errors = {};
  const name = String(input.name ?? "").trim();
  if (!name) errors.name = "Informe o alimento.";
  else if (name.length > 80) errors.name = "Nome com no máximo 80 caracteres.";
  if (!isValidDateKey(input.date)) errors.date = "Data inválida.";
  const time = input.time ? String(input.time) : "";
  if (time && !isValidTime(time)) errors.time = "Horário inválido.";
  if (!MEALS.some((m) => m.id === input.meal)) errors.meal = "Escolha a refeição.";
  const unit = UNITS.includes(input.unit) ? input.unit : null;
  if (!unit) errors.unit = "Escolha a unidade.";
  const qty = numberField(input.qty, "Porção", { min: 0.1, max: 5000, required: true, errors, key: "qty" });
  const kcal = numberField(input.kcal, "Calorias", { min: 0, max: 5000, errors, key: "kcal" });
  const protein = numberField(input.protein, "Proteína", { min: 0, max: 500, errors, key: "protein" });
  const carbs = numberField(input.carbs, "Carboidratos", { min: 0, max: 1000, errors, key: "carbs" });
  const fat = numberField(input.fat, "Gorduras", { min: 0, max: 500, errors, key: "fat" });
  const fiber = numberField(input.fiber, "Fibra", { min: 0, max: 200, errors, key: "fiber" });
  if (Object.keys(errors).length) return { ok: false, errors, value: null };
  return {
    ok: true, errors,
    value: { date: input.date, time, meal: input.meal, name, qty, unit, kcal, protein, carbs, fat, fiber, estimated: input.estimated !== false },
  };
}

const sum = (entries, key) => round1(entries.reduce((acc, e) => acc + (Number(e[key]) || 0), 0));

export function dayTotals(entries, date) {
  const day = entries.filter((e) => e.date === date);
  return {
    count: day.length,
    estimatedCount: day.filter((e) => e.estimated).length,
    kcal: Math.round(sum(day, "kcal")), protein: sum(day, "protein"), carbs: sum(day, "carbs"), fat: sum(day, "fat"), fiber: sum(day, "fiber"),
  };
}

export const entriesByMeal = (entries, date) =>
  MEALS.map((meal) => ({ ...meal, items: entries.filter((e) => e.date === date && e.meal === meal.id).sort((a, b) => (a.time || "").localeCompare(b.time || "")) }))
    .filter((group) => group.items.length);

/** Totais por data (null onde não há registro — lacuna, não zero). */
export const totalsPerDay = (entries, dates) =>
  dates.map((date) => {
    const t = dayTotals(entries, date);
    return { date, ...t, hasData: t.count > 0 };
  });

export function goalProgress(totals, goals = {}) {
  return ["kcal", "protein", "carbs", "fat"].map((key) => {
    const goal = goals[key] > 0 ? goals[key] : null;
    return { key, value: totals[key], goal, percent: goal ? Math.min(100, Math.round((totals[key] / goal) * 100)) : null };
  });
}

// ---- Referências (estimativas, não prescrição) ----
export function mifflinStJeor({ sex, weightKg, heightCm, age }) {
  if (!(weightKg > 0) || !(heightCm > 0) || !(age > 0)) return null;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return Math.round(base + (sex === "F" ? -161 : 5));
}

export const bmi = (weightKg, heightCm) => (weightKg > 0 && heightCm > 0 ? round1(weightKg / (heightCm / 100) ** 2) : null);

export const proteinRange = (weightKg) => (weightKg > 0 ? { min: Math.round(1.4 * weightKg), max: Math.round(2.0 * weightKg) } : null);

/** Aviso (não bloqueio) para meta calórica abaixo da estimativa do metabolismo basal. */
export function kcalGoalWarning(goalKcal, bmr) {
  if (!(goalKcal > 0) || !(bmr > 0) || goalKcal >= bmr) return null;
  return "Esta meta está abaixo da estimativa do seu metabolismo basal. Converse com um nutricionista antes de manter um déficit grande.";
}

// ---- Favoritos ----
export const favoriteFromEntry = (e) => ({ name: e.name, qty: e.qty, unit: e.unit, kcal: e.kcal, protein: e.protein, carbs: e.carbs, fat: e.fat, fiber: e.fiber, meal: e.meal });
export const isSameFavorite = (a, b) => a.name.toLowerCase() === b.name.toLowerCase() && a.unit === b.unit && a.qty === b.qty;
