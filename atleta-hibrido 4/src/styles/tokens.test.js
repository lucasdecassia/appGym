// Guarda de acessibilidade: pares de cores dos tokens precisam atender WCAG AA.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("./app.css", import.meta.url), "utf8");
const tokens = Object.fromEntries([...css.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})/g)].map((m) => [m[1], m[2]]));

const channel = (c) => { const v = c / 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const luminance = (hex) => { const n = parseInt(hex.slice(1), 16); return 0.2126 * channel(n >> 16) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255); };
const contrast = (a, b) => { const [hi, lo] = [luminance(tokens[a]), luminance(tokens[b])].sort((x, y) => y - x); return (hi + 0.05) / (lo + 0.05); };

test("paleta do pedido está presente", () => {
  const expected = { "color-bg": "#080d18", "color-surface": "#111b2b", "color-surface-raised": "#182438", "color-primary": "#246bce", "color-accent": "#65a7ff", "color-text": "#f4f7fc", "color-text-muted": "#aab8cc", "color-border": "#2a3a52" };
  for (const [k, v] of Object.entries(expected)) assert.equal(tokens[k].toLowerCase(), v, k);
});

const TEXT_PAIRS = [
  ["color-text", "color-bg"], ["color-text", "color-surface"], ["color-text", "color-surface-raised"],
  ["color-text-muted", "color-bg"], ["color-text-muted", "color-surface"], ["color-text-muted", "color-surface-raised"],
  ["color-accent", "color-bg"], ["color-accent", "color-surface"], ["color-accent", "color-surface-raised"],
  ["color-on-primary", "color-primary"], ["color-on-primary", "color-primary-hover"],
  ["color-on-success", "color-success"], ["color-on-warning", "color-warning"], ["color-on-error", "color-error"],
  ["color-success", "color-surface"], ["color-warning", "color-surface"], ["color-error", "color-surface"],
  ["color-text", "meth-warmup"], ["color-text", "meth-pyramid"], ["color-text", "meth-biset"], ["color-text", "meth-target"],
  ["color-text", "meth-drop"], ["color-text", "meth-super"], ["color-text", "meth-6x12"],
  ...[1, 2, 3, 4, 5].map((z) => ["color-on-zone", `zone-${z}`]),
];

for (const [fg, bg] of TEXT_PAIRS) {
  test(`contraste de texto ≥ 4,5:1 — ${fg} sobre ${bg}`, () => {
    assert.ok(contrast(fg, bg) >= 4.5, `${fg}/${bg} = ${contrast(fg, bg).toFixed(2)}`);
  });
}

for (const bg of ["color-bg", "color-surface", "color-surface-raised"]) {
  test(`borda de campos ≥ 3:1 contra ${bg}`, () => {
    assert.ok(contrast("color-border-strong", bg) >= 3, `${contrast("color-border-strong", bg).toFixed(2)}`);
  });
}

test("gráficos e zonas distinguíveis do fundo (≥ 3:1)", () => {
  for (const t of ["color-accent", "zone-1", "zone-2", "zone-3", "zone-4", "zone-5"]) assert.ok(contrast(t, "color-surface") >= 3, t);
});

test("componentes não usam cores literais (só tokens)", () => {
  const body = css.split("/* ===== Base")[1];
  assert.equal([...body.matchAll(/#[0-9a-fA-F]{3,8}\b/g)].length, 0);
});
