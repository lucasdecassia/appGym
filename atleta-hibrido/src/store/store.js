import { storage } from "../services/storage.js";
import { normalizeState } from "../lib/state.js";

const KEY = "atleta-hibrido-v1";

let state = normalizeState(storage.read(KEY));
const listeners = new Set();

export const getState = () => state;

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function commit(next, { silent = false } = {}) {
  state = next;
  storage.write(KEY, state);
  if (!silent) listeners.forEach((listener) => listener(state));
}

/** `mutator` altera um rascunho; `silent` salva sem re-renderizar (ex.: campos de texto). */
export function update(mutator, options) {
  const draft = structuredClone(state);
  mutator(draft);
  commit(draft, options);
}

export function replaceState(raw) {
  commit(normalizeState(raw));
}
