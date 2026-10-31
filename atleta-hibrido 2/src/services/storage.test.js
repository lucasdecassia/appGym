import test from "node:test";
import assert from "node:assert/strict";
import { createStorage } from "./storage.js";

const fakeBackend = () => {
  const m = new Map();
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => void m.set(k, v), removeItem: (k) => void m.delete(k) };
};

test("grava e lê JSON", () => {
  const s = createStorage(fakeBackend());
  assert.equal(s.write("k", { a: 1 }), true);
  assert.deepEqual(s.read("k"), { a: 1 });
});

test("chave ausente devolve o valor padrão", () => {
  assert.equal(createStorage(fakeBackend()).read("x", "padrao"), "padrao");
});

test("JSON corrompido não quebra a leitura", () => {
  const b = fakeBackend();
  b.setItem("k", "{quebrado");
  assert.equal(createStorage(b).read("k", "ok"), "ok");
});

test("backend que lança erro não derruba o app", () => {
  const boom = { getItem() { throw new Error("x"); }, setItem() { throw new Error("cheio"); }, removeItem() { throw new Error("x"); } };
  const s = createStorage(boom);
  assert.equal(s.read("k", 7), 7);
  assert.equal(s.write("k", 1), false);
  assert.doesNotThrow(() => s.remove("k"));
});

test("remove apaga a chave", () => {
  const s = createStorage(fakeBackend());
  s.write("k", 1);
  s.remove("k");
  assert.equal(s.read("k"), null);
});
