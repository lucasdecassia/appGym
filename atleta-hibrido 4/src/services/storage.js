// Único ponto de acesso ao armazenamento. O resto do app nunca toca em localStorage.

function memoryBackend() {
  const data = new Map();
  return {
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => void data.set(k, String(v)),
    removeItem: (k) => void data.delete(k),
  };
}

function browserBackend() {
  try {
    return globalThis.localStorage ?? memoryBackend();
  } catch {
    return memoryBackend(); // acesso bloqueado (modo privado, iframe…)
  }
}

export function createStorage(backend) {
  return {
    read(key, fallback = null) {
      try {
        const raw = backend.getItem(key);
        return raw == null ? fallback : JSON.parse(raw);
      } catch {
        return fallback;
      }
    },
    write(key, value) {
      try {
        backend.setItem(key, JSON.stringify(value));
        return true;
      } catch {
        return false;
      }
    },
    remove(key) {
      try {
        backend.removeItem(key);
      } catch {
        /* nada a fazer */
      }
    },
  };
}

export const storage = createStorage(browserBackend());
