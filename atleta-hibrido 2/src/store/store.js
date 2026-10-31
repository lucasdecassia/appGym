import { storage } from "../services/storage.js";
import { normalizeState, needsMigration } from "../lib/state.js";

export const KEY = "atleta-hibrido-v1"; // chave mantida para preservar dados da versão anterior
const BACKUP_KEY = `${KEY}-pre-v2-backup`;

function load() {
  const raw = storage.read(KEY);
  // Backup reversível antes de qualquer migração estrutural (nunca sobrescreve um backup existente).
  if (needsMigration(raw) && storage.read(BACKUP_KEY) == null) storage.write(BACKUP_KEY, raw);
  return normalizeState(raw);
}

let state = load();
storage.write(KEY, state);
const listeners = new Set();

export const getState = () => state;

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function commit(next, { silent = false } = {}) {
  state = next;
  const saved = storage.write(KEY, state);
  if (!silent) listeners.forEach((listener) => listener(state, { saved }));
  return saved;
}

/** `mutator` altera um rascunho; `silent` salva sem re-renderizar. Retorna se gravou no armazenamento. */
export function update(mutator, options) {
  const draft = structuredClone(state);
  mutator(draft);
  return commit(draft, options);
}

export function replaceState(raw) {
  commit(normalizeState(raw));
}
