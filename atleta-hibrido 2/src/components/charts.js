// Gráficos SVG sem dependências. Sempre com título, unidade, período, origem do dado e estado vazio.
import { esc } from "./html.js";

const W = 320, H = 170, L = 38, R = 10, T = 16, B = 30;
const fmt = (n, d = 0) => (Math.round(n * 10 ** d) / 10 ** d).toString().replace(".", ",");

function niceMax(v) {
  if (v <= 0) return 1;
  const pow = 10 ** Math.floor(Math.log10(v));
  const f = v / pow;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * pow;
}

const frame = ({ id, title, unit, period, source }, body, summary) => `<figure class="chart">
  <figcaption><b>${esc(title)}</b><span>${esc(unit)} · ${esc(period)}</span></figcaption>${body}
  <div class="chart-meta">Fonte: ${esc(source)}${summary ? ` · ${esc(summary)}` : ""}</div></figure>`;

const empty = (cfg) => frame(cfg, '<div class="empty">Sem registros neste período.</div>', "");

function summarize(values, unit, decimals) {
  const valid = values.filter((v) => v != null);
  const mean = valid.reduce((a, b) => a + b, 0) / valid.length;
  return `média ${fmt(mean, decimals)} ${unit} (${valid.length} de ${values.length} com dado)`;
}

const labelEvery = (n) => (n <= 8 ? 1 : Math.ceil(n / 7));

/** points: [{ label, value|null }] — `null` aparece como lacuna ("sem dado"), nunca como zero. */
export function barChart({ points, goal = null, decimals = 0, ...cfg }) {
  const values = points.map((p) => p.value);
  if (!values.some((v) => v != null)) return empty(cfg);
  const max = niceMax(Math.max(goal || 0, ...values.filter((v) => v != null)));
  const pw = W - L - R, ph = H - T - B, slot = pw / points.length, bw = Math.min(28, slot * 0.6);
  const y = (v) => T + ph - (v / max) * ph;
  let svg = `<line class="ch-axis" x1="${L}" y1="${T + ph}" x2="${W - R}" y2="${T + ph}"/><text class="ch-txt" x="${L - 4}" y="${T + ph + 3}" text-anchor="end">0</text><text class="ch-txt" x="${L - 4}" y="${T + 4}" text-anchor="end">${fmt(max, decimals)}</text>`;
  if (goal) svg += `<line class="ch-goal" x1="${L}" y1="${y(goal)}" x2="${W - R}" y2="${y(goal)}"/><text class="ch-txt" x="${W - R}" y="${y(goal) - 3}" text-anchor="end">meta ${fmt(goal, decimals)}</text>`;
  const every = labelEvery(points.length);
  points.forEach((p, i) => {
    const cx = L + slot * i + slot / 2;
    if (p.value == null) svg += `<circle class="ch-gap" cx="${cx}" cy="${T + ph - 3}" r="3"><title>${esc(p.label)}: sem dado</title></circle>`;
    else {
      svg += `<rect class="ch-bar" x="${cx - bw / 2}" y="${y(p.value)}" width="${bw}" height="${Math.max(1, T + ph - y(p.value))}" rx="3"><title>${esc(p.label)}: ${fmt(p.value, decimals)} ${esc(cfg.unit)}</title></rect>`;
      if (points.length <= 8) svg += `<text class="ch-val" x="${cx}" y="${y(p.value) - 3}" text-anchor="middle">${fmt(p.value, decimals)}</text>`;
    }
    if (i % every === 0) svg += `<text class="ch-txt" x="${cx}" y="${H - 10}" text-anchor="middle">${esc(p.label)}</text>`;
  });
  const summary = summarize(values, cfg.unit, decimals);
  return frame(cfg, `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(cfg.title)}: ${esc(summary)}" class="ch">${svg}</svg>`, summary);
}

/** Série temporal: linha interrompida nas lacunas, eixo Y ajustado aos dados. */
export function lineChart({ points, decimals = 0, ...cfg }) {
  const values = points.map((p) => p.value);
  const valid = values.filter((v) => v != null);
  if (!valid.length) return empty(cfg);
  let lo = Math.min(...valid), hi = Math.max(...valid);
  if (lo === hi) { lo -= 1; hi += 1; }
  const pad = (hi - lo) * 0.15; lo -= pad; hi += pad;
  const pw = W - L - R, ph = H - T - B, slot = pw / Math.max(1, points.length - 1);
  const x = (i) => (points.length === 1 ? L + pw / 2 : L + slot * i);
  const y = (v) => T + ph - ((v - lo) / (hi - lo)) * ph;
  let svg = `<line class="ch-axis" x1="${L}" y1="${T + ph}" x2="${W - R}" y2="${T + ph}"/><text class="ch-txt" x="${L - 4}" y="${T + 4}" text-anchor="end">${fmt(hi, decimals)}</text><text class="ch-txt" x="${L - 4}" y="${T + ph + 3}" text-anchor="end">${fmt(lo, decimals)}</text>`;
  let run = [];
  const flush = () => { if (run.length > 1) svg += `<polyline class="ch-line" fill="none" points="${run.join(" ")}"/>`; run = []; };
  points.forEach((p, i) => { if (p.value == null) flush(); else run.push(`${x(i)},${y(p.value)}`); });
  flush();
  const every = labelEvery(points.length);
  points.forEach((p, i) => {
    if (p.value != null) svg += `<circle class="ch-dot" cx="${x(i)}" cy="${y(p.value)}" r="3.5"><title>${esc(p.label)}: ${fmt(p.value, decimals)} ${esc(cfg.unit)}</title></circle>`;
    if (i % every === 0) svg += `<text class="ch-txt" x="${x(i)}" y="${H - 10}" text-anchor="middle">${esc(p.label)}</text>`;
  });
  const summary = `de ${fmt(valid[0], decimals)} a ${fmt(valid[valid.length - 1], decimals)} ${cfg.unit} (${valid.length} registros)`;
  return frame(cfg, `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(cfg.title)}: ${esc(summary)}" class="ch">${svg}</svg>`, summary);
}
