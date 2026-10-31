// Monta a pergunta para uma IA externa (sem chave, sem servidor). Só conteúdo do plano: nenhum dado pessoal.
import { RUNS, LIFTS, ZONES } from "../data/plan.js";
import { runKm, runMinutes, formatKm, formatStepVolume } from "./runStats.js";
import { formatSets } from "./exercises.js";

export const AI_LINKS = [
  { id: "claude", label: "Abrir o Claude", url: "https://claude.ai/new" },
  { id: "chatgpt", label: "Abrir o ChatGPT", url: "https://chatgpt.com/" },
];

const RULES = [
  "Explique em português simples, como se eu fosse iniciante, e defina qualquer termo técnico.",
  "Se faltar informação, diga o que não sabe e me pergunte.",
  "Avise quando algo for estimativa ou orientação geral.",
  "Não faça diagnóstico nem prescreva dieta ou medicamentos.",
  "Se eu relatar dor forte, tontura, falta de ar fora do normal ou dor no peito, oriente a parar e procurar um profissional de saúde.",
  "Não mude o plano por conta própria: sugira alternativas e peça a minha confirmação.",
];

const zoneLine = (id) => {
  const z = ZONES.find((x) => x.id === id);
  return `${z.id} (${z.name}): pace ${z.pace}, esforço RPE ${z.rpe} de 10`;
};

function describeRun(key) {
  const r = RUNS[key];
  const zones = [...new Set(r.steps.map((s) => s.zone))];
  return [
    `Treino de corrida: ${r.name} (${r.day}).`,
    `Objetivo: ${r.objective}`,
    `Por que está no plano: ${r.why}`,
    `Como executar: ${r.howTo}`,
    "Passo a passo:",
    ...r.plain.map((p, i) => `${i + 1}. ${p.text}`),
    "Etapas detalhadas:",
    ...r.steps.map((s) => `- ${s.label}: ${formatStepVolume(s)}, zona ${s.zone}`),
    `Total: ${formatKm(runKm(r))} km de distância, mais ${runMinutes(r)} min em etapas por tempo.`,
    "Zonas usadas:",
    ...zones.map((z) => `- ${zoneLine(z)}`),
  ];
}

function describeLift(key) {
  const l = LIFTS[key];
  return [
    `Treino de musculação: ${l.title} — ${l.focus}.`,
    `Objetivo: ${l.objective}`,
    "Blocos:",
    ...l.blocks.map((b) => `- Bloco ${b.number} (${b.method}, pausa ${b.rest.label}): ${b.exercises.map((e) => `${e.name}${e.sets ? ` — ${formatSets(e)}` : ""}`).join(" + ")}`),
  ];
}

/** kind: "run" | "lift". Lança Error se a sessão não existir. */
export function buildSessionPrompt(kind, key) {
  const exists = kind === "run" ? RUNS[key] : kind === "lift" ? LIFTS[key] : null;
  if (!exists) throw new Error(`Sessão desconhecida: ${kind}/${key}`);
  const body = kind === "run" ? describeRun(key) : describeLift(key);
  return [
    "Você é um assistente de treino. Vou te mostrar um treino do meu plano e tirar uma dúvida.",
    "",
    ...body,
    "",
    "Regras para a resposta:",
    ...RULES.map((r) => `- ${r}`),
    "",
    "Minha dúvida:",
    "(escreva aqui a sua pergunta)",
  ].join("\n");
}
