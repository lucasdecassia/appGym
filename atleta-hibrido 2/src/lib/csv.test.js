import test from "node:test";
import assert from "node:assert/strict";
import { toCsv } from "./csv.js";

const cols = [{ key: "a", label: "A" }, { key: "b", label: "B" }];

test("cabeçalho, linhas e BOM", () => {
  const csv = toCsv([{ a: 1, b: "x" }], cols);
  assert.ok(csv.startsWith("\uFEFFA,B\r\n1,x"));
});

test("escapa aspas, vírgulas e quebras de linha", () => {
  const csv = toCsv([{ a: 'diz "oi"', b: "a,b\nc" }], cols);
  assert.match(csv, /"diz ""oi""","a,b\nc"/);
});

test("neutraliza fórmulas mas mantém números negativos", () => {
  const csv = toCsv([{ a: "=SOMA(A1)", b: -5 }], cols);
  assert.match(csv, /'=SOMA\(A1\),-5/);
});

test("valores vazios", () => {
  assert.match(toCsv([{ a: null }], cols), /\r\n,\r\n$/);
});
