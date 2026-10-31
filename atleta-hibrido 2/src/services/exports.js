import { toCsv } from "../lib/csv.js";
import { MEALS } from "../lib/nutrition.js";
import { CONTEXTS } from "../lib/hydration.js";
import { RUNS, LIFTS } from "../data/plan.js";

const label = (list, id) => list.find((x) => x.id === id)?.label ?? id;
const byDate = (rows) => [...rows].sort((a, b) => a.date.localeCompare(b.date) || (a.time || "").localeCompare(b.time || ""));

const BUILDERS = {
  training: (s) => ({
    columns: [["date", "data"], ["kind", "tipo"], ["session", "sessão"], ["durationMin", "duração_min"], ["km", "distância_km"], ["rpe", "rpe"], ["cadenceAvg", "cadência_média_spm"], ["cadenceMax", "cadência_máx_spm"], ["notes", "observações"]],
    rows: byDate(s.logs).map((l) => ({ ...l, kind: l.kind === "run" ? "corrida" : "força", session: l.kind === "run" ? RUNS[l.key]?.name ?? l.key : LIFTS[l.key]?.title ?? l.key })),
  }),
  nutrition: (s) => ({
    columns: [["date", "data"], ["time", "hora"], ["meal", "refeição"], ["name", "alimento"], ["qty", "porção"], ["unit", "unidade"], ["kcal", "kcal"], ["protein", "proteína_g"], ["carbs", "carboidratos_g"], ["fat", "gorduras_g"], ["fiber", "fibra_g"], ["estimated", "estimativa"]],
    rows: byDate(s.nutrition.entries).map((e) => ({ ...e, meal: label(MEALS, e.meal), estimated: e.estimated ? "sim" : "não" })),
  }),
  hydration: (s) => ({
    columns: [["date", "data"], ["time", "hora"], ["context", "contexto"], ["ml", "volume_ml"]],
    rows: byDate(s.hydration.entries).map((e) => ({ ...e, context: label(CONTEXTS, e.context) })),
  }),
  sleep: (s) => ({
    columns: [["date", "data"], ["bed", "dormiu"], ["wake", "acordou"], ["minutes", "duração_min"], ["quality", "qualidade_1a5"], ["feeling", "sensação_1a5"], ["fatigue", "fadiga_1a5"], ["soreness", "dor_1a5"], ["restDay", "descanso"], ["notes", "observações"]],
    rows: byDate(s.sleep).map((e) => ({ ...e, restDay: e.restDay ? "sim" : "não" })),
  }),
};

export const CSV_KINDS = Object.keys(BUILDERS);

/** Gera { filename, text } de um conjunto de dados; lança Error para tipo desconhecido. */
export function buildCsv(kind, state, now = new Date()) {
  const builder = BUILDERS[kind];
  if (!builder) throw new Error(`Exportação desconhecida: ${kind}`);
  const { columns, rows } = builder(state);
  return { filename: `atleta-hibrido-${kind}-${now.toISOString().slice(0, 10)}.csv`, text: toCsv(rows, columns.map(([key, label]) => ({ key, label }))) };
}
