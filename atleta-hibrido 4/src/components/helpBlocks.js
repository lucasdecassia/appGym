// Blocos de ajuda: passo a passo, perguntas frequentes e painel "Tirar dúvida com uma IA".
import { ZONES } from "../data/plan.js";
import { AI_LINKS } from "../lib/aiPrompt.js";
import { esc, zoneBadge } from "./html.js";

const zone = (id) => ZONES.find((z) => z.id === id);

/** Lista numerada na ordem real do treino; cada passo mostra a zona com pace e RPE. */
export function plainSteps(run) {
  const items = run.plain.map((p) => {
    const zones = p.zones.map((id) => `<span class="zl">${zoneBadge(id)} Pace ${esc(zone(id).pace)} · RPE ${esc(zone(id).rpe)}</span>`).join("");
    return `<li>${esc(p.text)}${zones}</li>`;
  }).join("");
  return `<ol class="plain">${items}</ol>`;
}

export function plainList(lines) {
  return `<ol class="plain">${lines.map((l) => `<li>${esc(l)}</li>`).join("")}</ol>`;
}

export function faq(list, title = "Dúvidas frequentes") {
  const items = list.map(([q, a]) => `<dt>${esc(q)}</dt><dd>${esc(a)}</dd>`).join("");
  return `<details class="card"><summary><h3>❓ ${esc(title)}</h3></summary><dl style="margin:6px 0 0">${items}</dl></details>`;
}

export const aiButton = (kind, key) =>
  `<div style="margin-top:12px"><button class="btn sec" data-act="askAi" data-kind="${kind}" data-key="${key}">💬 Tirar dúvida com uma IA</button></div>`;

/** Painel com a pergunta pronta (copiada para a área de transferência) e links para abrir uma IA. */
export function aiCard(ui) {
  if (!ui.ai) return "";
  const status = ui.ai.copied
    ? '<div class="banner" role="status">✓ Pergunta copiada. Abra uma IA abaixo, cole o texto e escreva a sua dúvida no final.</div>'
    : '<div class="banner warn" role="status">Não foi possível copiar automaticamente. Toque em “Copiar pergunta” ou selecione o texto abaixo.</div>';
  const links = AI_LINKS.map((l) => `<a class="btn" href="${esc(l.url)}" target="_blank" rel="noopener noreferrer">${esc(l.label)}</a>`).join("");
  return `<div class="card"><div class="row sp"><h3>💬 Tirar dúvida com uma IA</h3><button class="btn sec small" data-act="closeAi">Fechar</button></div>
    ${status}
    <label class="f" for="ai-text">Pergunta pronta (o treino e as regras de segurança já estão incluídos)</label>
    <textarea class="in ro" id="ai-text" readonly>${esc(ui.ai.text)}</textarea>
    <div class="grid2" style="margin-top:10px"><button class="btn" data-act="copyAi">Copiar pergunta</button><span></span></div>
    <div class="ai-links" style="margin-top:8px">${links}</div>
    <div class="note">Só vai o conteúdo do treino: nenhum dado pessoal seu. Respostas de IA são orientação geral e podem errar; confirme com um profissional em caso de dúvida de saúde.</div></div>`;
}
