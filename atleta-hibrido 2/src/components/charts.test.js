import test from "node:test";
import assert from "node:assert/strict";
import { barChart, lineChart } from "./charts.js";

const cfg = { id: "c", title: "Corrida por semana", unit: "km", period: "últimas 8 semanas", source: "registros do app" };

test("barChart mostra título, unidade, período, fonte e resumo acessível", () => {
  const html = barChart({ ...cfg, points: [{ label: "26/10", value: 12 }, { label: "02/11", value: 6 }] });
  assert.match(html, /Corrida por semana/);
  assert.match(html, /km · últimas 8 semanas/);
  assert.match(html, /Fonte: registros do app/);
  assert.match(html, /role="img" aria-label="Corrida por semana: média 9 km \(2 de 2 com dado\)"/);
});

test("lacunas aparecem como 'sem dado' e não entram na média", () => {
  const html = barChart({ ...cfg, points: [{ label: "a", value: 10 }, { label: "b", value: null }, { label: "c", value: 20 }] });
  assert.match(html, /b: sem dado/);
  assert.match(html, /média 15 km \(2 de 3 com dado\)/);
});

test("sem nenhum dado mostra estado vazio", () => {
  assert.match(barChart({ ...cfg, points: [{ label: "a", value: null }] }), /Sem registros neste período/);
  assert.match(lineChart({ ...cfg, points: [] }), /Sem registros neste período/);
});

test("meta aparece como linha rotulada", () => {
  assert.match(barChart({ ...cfg, goal: 2500, unit: "ml", points: [{ label: "a", value: 1800 }] }), /meta 2500/);
});

test("lineChart quebra a linha nas lacunas e aceita um único ponto", () => {
  const broken = lineChart({ ...cfg, points: [{ label: "a", value: 80 }, { label: "b", value: 81 }, { label: "c", value: null }, { label: "d", value: 82 }, { label: "e", value: 83 }] });
  assert.equal((broken.match(/<polyline/g) || []).length, 2);
  assert.match(lineChart({ ...cfg, points: [{ label: "a", value: 80 }] }), /<circle class="ch-dot"/);
});

test("texto de entrada é escapado", () => {
  assert.doesNotMatch(barChart({ ...cfg, title: "<script>x</script>", points: [{ label: "<b>", value: 1 }] }), /<script>/);
});
