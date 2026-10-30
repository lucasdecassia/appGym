import { normalizeState } from "../lib/state.js";

const APP = "atleta-hibrido";

export function buildBackup(state, now = new Date()) {
  return {
    filename: `atleta-hibrido-backup-${now.toISOString().slice(0, 10)}.json`,
    json: JSON.stringify({ app: APP, exportedAt: now.toISOString(), state }, null, 2),
  };
}

/** Lê o texto de um backup e devolve um estado válido; lança Error se não for do app. */
export function parseBackup(text, now = new Date()) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("O arquivo não é um JSON válido.");
  }
  if (!data || data.app !== APP || typeof data.state !== "object") {
    throw new Error("Este arquivo não é um backup do Atleta Híbrido.");
  }
  return normalizeState(data.state, now);
}
