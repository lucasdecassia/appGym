// Dados estáticos do plano "Desafio Atleta Híbrido" (Time Híbrido).
// Textos visíveis ficam em português; identificadores em inglês.

export const DAYS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
export const DAY_INITIALS = ["S", "T", "Q", "Q", "S", "S", "D"];
export const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

export const ZONES = [
  { id: "Z1", pace: "Acima de 6:25 min/km", name: "Recuperação · muito leve", min: 0.5, max: 0.6, rpe: "2–3", talk: "Conversa confortável, frases longas.", purpose: "Recuperação ativa, aquecimento e desaquecimento.", block: "5–10 min no aquecimento/desaquecimento, ou corridas curtas de recuperação.", recovery: "Não exige recuperação extra." },
  { id: "Z2", pace: "5:40–6:25 min/km", name: "Aeróbia · leve", min: 0.6, max: 0.7, rpe: "3–4", talk: "Frases completas sem esforço.", purpose: "Constrói base aeróbia e eficiência; esforço leve e sustentável.", block: "30–90 min contínuos.", recovery: "Baixa; pode ser repetida em dias seguidos." },
  { id: "Z3", pace: "5:20–5:40 min/km", name: "Moderada · tempo controlado", min: 0.7, max: 0.85, rpe: "5–6", talk: "Frases curtas; conversa exige atenção.", purpose: "Desenvolve a capacidade de sustentar ritmos mais exigentes.", block: "10–40 min contínuos ou em blocos longos.", recovery: "Pausa curta ou nenhuma entre blocos; atenção à fadiga acumulada." },
  { id: "Z4", pace: "4:55–5:15 min/km", name: "Limiar · forte", min: 0.85, max: 0.95, rpe: "7–8", talk: "Poucas palavras por vez.", purpose: "Trabalha tolerância e sustentação próxima ao limiar.", block: "3–20 min em blocos.", recovery: "Recuperação ativa leve entre blocos (Z1–Z2)." },
  { id: "Z5", pace: "Abaixo de 4:55 min/km", name: "Alta intensidade · VO₂", min: 0.95, max: 1.0, rpe: "9–10", talk: "Falar é muito difícil.", purpose: "Potência aeróbia e capacidade de alta intensidade, em intervalos curtos.", block: "30 s–5 min por repetição.", recovery: "Recuperação do tamanho do esforço ou maior; dias seguintes mais leves." },
];

export const RUNS = {
  interval: {
    name: "Intervalado 500 m — FORTE",
    day: "3ª feira",
    objective: "Melhorar velocidade e potência aeróbia com tiros curtos.",
    why: "Tiros de 500 m em Z5 estimulam alta intensidade; a recuperação em Z1 entre eles permite repetir a qualidade.",
    howTo: "Faça cada tiro em esforço muito forte, porém controlado. Na recuperação, trote bem leve ou caminhe até a respiração normalizar.",
    summary: "Tiros em Z5 com recuperação em Z1 entre eles.",
    plain: [
      { text: "Aquecimento: corra 3 km em ritmo leve para preparar o corpo.", zones: ["Z2"] },
      { text: "Repita 6 vezes este par, sem pular nenhuma: corra 500 metros bem forte (1 tiro) e logo depois descanse 2 minutos, trotando bem leve ou caminhando.", zones: ["Z5", "Z1"] },
      { text: "Desaquecimento: 5 minutos bem leve para o corpo voltar ao normal.", zones: ["Z1"] },
    ],
    steps: [
      { label: "Aquecimento / base", reps: 1, zone: "Z2", value: 3, unit: "km" },
      { label: "Tiros fortes", reps: 6, zone: "Z5", value: 500, unit: "m" },
      { label: "Recuperação entre tiros", reps: 6, zone: "Z1", value: 2, unit: "min" },
      { label: "Desaquecimento", reps: 1, zone: "Z1", value: 5, unit: "min" },
    ],
  },
  steadyWed: {
    name: "Contínuo 6 km — MODERADO",
    day: "4ª feira",
    objective: "Sustentar um ritmo moderado e constante.",
    why: "O contínuo em Z3 treina controle de ritmo, importante para completar a meia maratona.",
    howTo: "Mantenha o esforço estável do começo ao fim. Se a conversa ficar impossível, reduza o ritmo.",
    summary: "Ritmo constante em Z3.",
    plain: [
      { text: "Aquecimento: 5 minutos bem leve.", zones: ["Z1"] },
      { text: "Corra 6 km em ritmo moderado e constante, sem acelerar nem desacelerar.", zones: ["Z3"] },
      { text: "Desaquecimento: 5 minutos bem leve.", zones: ["Z1"] },
    ],
    steps: [
      { label: "Aquecimento", reps: 1, zone: "Z1", value: 5, unit: "min" },
      { label: "Bloco principal", reps: 1, zone: "Z3", value: 6, unit: "km" },
      { label: "Desaquecimento", reps: 1, zone: "Z1", value: 5, unit: "min" },
    ],
  },
  fartlek: {
    name: "Fartlek 1:3",
    day: "6ª feira",
    objective: "Ganhar tolerância ao esforço alternando ritmos moderado e forte.",
    why: "Alternar Z3 e Z4 treina a sustentar esforço mais alto sem parar, com variação que reduz a monotonia.",
    howTo: "Cada par é 1 km em Z3 seguido de 3 km em Z4, sem pausa. Se não conseguir completar em Z4, reduza para Z3 em vez de parar.",
    summary: "Repetir 3× o par: 1 km em Z3 → 3 km em Z4 (conforme o slide original, ≈12 km no total).",
    plain: [
      { text: "Aquecimento: 5 minutos de trote leve.", zones: ["Z2"] },
      { text: "Repita 3 vezes, uma logo após a outra, sem parar: primeiro 1 km em ritmo moderado e, em seguida, 3 km em ritmo forte. Cada repetição tem 4 km; as 3 repetições somam 12 km.", zones: ["Z3", "Z4"] },
      { text: "Desaquecimento: 5 minutos bem leve.", zones: ["Z1"] },
    ],
    steps: [
      { label: "Aquecimento", reps: 1, zone: "Z2", value: 5, unit: "min" },
      { label: "Bloco moderado", reps: 3, zone: "Z3", value: 1, unit: "km" },
      { label: "Bloco forte", reps: 3, zone: "Z4", value: 3, unit: "km" },
      { label: "Desaquecimento", reps: 1, zone: "Z1", value: 5, unit: "min" },
    ],
  },
  steadySun: {
    name: "Contínuo 6 km — MODERADO",
    day: "Domingo",
    objective: "Sustentar um ritmo moderado e constante.",
    why: "Repete o contínuo de quarta para consolidar o controle de ritmo ao longo da semana.",
    howTo: "Mantenha o esforço estável do começo ao fim. Se a conversa ficar impossível, reduza o ritmo.",
    summary: "Mesmo formato de quarta.",
    plain: [
      { text: "Aquecimento: 5 minutos bem leve.", zones: ["Z1"] },
      { text: "Corra 6 km em ritmo moderado e constante, sem acelerar nem desacelerar.", zones: ["Z3"] },
      { text: "Desaquecimento: 5 minutos bem leve.", zones: ["Z1"] },
    ],
    steps: [
      { label: "Aquecimento", reps: 1, zone: "Z1", value: 5, unit: "min" },
      { label: "Bloco principal", reps: 1, zone: "Z3", value: 6, unit: "km" },
      { label: "Desaquecimento", reps: 1, zone: "Z1", value: 5, unit: "min" },
    ],
  },
};
export const RUN_KEYS = Object.keys(RUNS);

const rest = (label, seconds) => ({ label, seconds });
const CONFIRM_PYRAMID = "O slide indica 4 séries com 5 valores de reps — confirme com o Time Híbrido.";

export const LIFTS = {
  A: {
    title: "Treino A", focus: "Peito, ombro e tríceps",
    objective: "Desenvolver força e volume de peito, ombros e tríceps.",
    blocks: [
      { number: 1, method: "Aquecimento", rest: rest("1 min", 60), exercises: [{ name: "Aquecimento / mobilidade pré-treino de superiores" }] },
      { number: 2, method: "Pirâmide", rest: rest("90 seg", 90), exercises: [{ name: "Supino reto c/ halteres", sets: 4, reps: "15" }] },
      { number: 3, method: "Bi-set", rest: rest("90 seg", 90), exercises: [{ name: "Crucifixo inclinado c/ halteres", sets: 4, reps: "15" }, { name: "Supino inclinado c/ halteres", sets: 4, reps: "15" }] },
      { number: 4, method: "Bi-set", rest: rest("90 seg", 90), exercises: [{ name: "Peck deck", sets: 4, reps: "15" }, { name: "Flexão c/ ponto zero", sets: 4, reps: "até a falha" }] },
      { number: 5, method: "Pirâmide", rest: rest("1–3 min", 120), exercises: [{ name: "Desenvolvimento c/ halteres", sets: 4, reps: "15-12-10-8" }] },
      { number: 6, method: "Meta de repetição", rest: rest("90 seg", 90), exercises: [{ name: "Tríceps testa c/ halteres", sets: 4, reps: "15" }] },
      { number: 7, method: "Bi-set", rest: rest("90 seg", 90), exercises: [{ name: "Tríceps coice c/ halteres", sets: 4, reps: "15" }, { name: "Tríceps c/ corda", sets: 4, reps: "15" }] },
    ],
  },
  B: {
    title: "Treino B", focus: "Membros inferiores",
    objective: "Desenvolver força e volume de pernas e posterior de coxa.",
    blocks: [
      { number: 1, method: "Aquecimento", rest: rest("45 seg", 45), exercises: [{ name: "Flexibilidade e mobilidade inferiores" }, { name: "Agachamento c/ peso do corpo", sets: 3, reps: "15" }] },
      { number: 2, method: "Pirâmide", rest: rest("1–3 min", 120), exercises: [{ name: "Terra deadlift", sets: 4, reps: "15-12-10-8-6", note: CONFIRM_PYRAMID }] },
      { number: 3, method: "6 pesado / 12 leve", rest: rest("2 min", 120), exercises: [{ name: "Mesa flexora", sets: 4, reps: "6 / 12", note: "Alternar séries pesadas (6) e leves (12) — veja o vídeo do material." }] },
      { number: 4, method: "Pirâmide", rest: rest("1–3 min", 120), exercises: [{ name: "Stiff c/ barra ou halteres", sets: 4, reps: "20-15-12-10-8", note: CONFIRM_PYRAMID }] },
      { number: 5, method: "Meta de repetição", rest: rest("2 min", 120), exercises: [{ name: "Leg press 45°", sets: 4, reps: "15" }] },
      { number: 6, method: "Bi-set", rest: rest("3 min", 180), exercises: [{ name: "Agachamento livre", sets: 4, reps: "15" }, { name: "Cadeira chinesa", sets: 4, reps: "até a falha" }] },
      { number: 7, method: "Meta de repetição", rest: rest("2 min", 120), exercises: [{ name: "Cadeira abdutora", sets: 4, reps: "20" }, { name: "Panturrilha em pé", sets: 4, reps: "20" }] },
    ],
  },
  C: {
    title: "Treino C", focus: "Costas e bíceps",
    objective: "Desenvolver força e volume de costas e bíceps.",
    blocks: [
      { number: 1, method: "Aquecimento", rest: rest("1 min", 60), exercises: [{ name: "Aquecimento / mobilidade pré-treino de superiores" }] },
      { number: 2, method: "Pirâmide", rest: rest("1–3 min", 120), exercises: [{ name: "Remada curvada c/ barra", sets: 4, reps: "15-12-10-8" }] },
      { number: 3, method: "Meta de repetição", rest: rest("90 seg", 90), exercises: [{ name: "Barra livre — meta de 40 reps no total", note: "Se fizer menos de 6 reps, use o graviton." }] },
      { number: 4, method: "Bi-set", rest: rest("2 min", 120), exercises: [{ name: "Puxada alta", sets: 4, reps: "15" }, { name: "Remada c/ halteres", sets: 4, reps: "15" }] },
      { number: 5, method: "Meta de repetição", rest: rest("1 min", 60), exercises: [{ name: "Serrote c/ halteres", sets: 4, reps: "15" }] },
      { number: 6, method: "Pirâmide", rest: rest("2 min", 120), exercises: [{ name: "Posterior de ombros na polia", sets: 4, reps: "15" }] },
      { number: 7, method: "Bi-set", rest: rest("2 min", 120), exercises: [{ name: "Rosca bíceps", sets: 4, reps: "15" }, { name: "Encolhimento c/ halteres", sets: 4, reps: "15" }] },
    ],
  },
  D: {
    title: "Treino D", focus: "Ombros e abdominal",
    objective: "Desenvolver ombros e fortalecer o abdômen.",
    blocks: [
      { number: 1, method: "Aquecimento", rest: rest("1 min", 60), exercises: [{ name: "Aquecimento / mobilidade pré-treino de superiores" }] },
      { number: 2, method: "Pirâmide", rest: rest("1–3 min", 120), exercises: [{ name: "Desenvolvimento c/ halteres", sets: 4, reps: "15-12-10-8" }] },
      { number: 3, method: "Drop-set", rest: rest("90 seg", 90), exercises: [{ name: "Elevação lateral com anilhas (dropset)", sets: 4, reps: "15" }] },
      { number: 4, method: "Drop-set", rest: rest("90 seg", 90), exercises: [{ name: "Elevação frontal c/ halter (dropset)", sets: 4, reps: "15" }] },
      { number: 5, method: "Super-set", rest: rest("90 seg", 90), exercises: [{ name: "Elevação de pernas", sets: 4, reps: "15" }, { name: "Rolinho (abdominal)", sets: 4, reps: "15" }, { name: "Prancha", sets: 4, reps: "1 min" }] },
    ],
  },
};
export const LIFT_KEYS = Object.keys(LIFTS);

// Sugestão de distribuição (corrida segue o plano; musculação separa pernas dos tiros).
export const DEFAULT_SCHEDULE = [
  { lift: "A" },
  { run: "interval" },
  { run: "steadyWed", lift: "C" },
  { lift: "D" },
  { run: "fartlek" },
  { lift: "B" },
  { run: "steadySun" },
];

export const GLOSSARY = [
  ["Pirâmide", "Variar as repetições entre as séries (ex.: 15-12-10-8), subindo a carga conforme as repetições diminuem."],
  ["Bi-set", "Dois exercícios seguidos, sem descanso entre eles; descansa só ao terminar o par."],
  ["Super-set", "Sequência de exercícios (aqui, 3 no abdominal) sem pausa; descansa ao final."],
  ["Drop-set", "Ao chegar perto da falha, reduza a carga e continue imediatamente."],
  ["Meta de repetição", "Cumprir o total de séries × repetições. Ao completar tudo com boa técnica, aumente a carga na próxima sessão."],
  ["6 pesado / 12 leve", "Interpretação: alternar séries pesadas de 6 reps e mais leves de 12 reps. Confirme no vídeo do material."],
];

// Classe CSS do método (sem acento/espaço) usada nos cartões de bloco.
export const METHOD_CLASS = {
  "Aquecimento": "m-warmup", "Pirâmide": "m-pyramid", "Bi-set": "m-biset", "Meta de repetição": "m-target",
  "Drop-set": "m-drop", "Super-set": "m-super", "6 pesado / 12 leve": "m-6x12",
};

/** Fase da etapa de corrida, a partir do rótulo. */
export function phaseOf(label) {
  if (/^Aquec/i.test(label)) return "Aquecimento";
  if (/^Desaquec/i.test(label)) return "Desaquecimento";
  if (/^Recupera/i.test(label)) return "Recuperação";
  return "Bloco principal";
}

export const METHOD_HELP = Object.fromEntries(GLOSSARY);
