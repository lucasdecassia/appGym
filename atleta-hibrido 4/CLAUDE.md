# CLAUDE.md

Guia para agentes de IA que trabalhem neste repositório. Leia também `docs/ATLETA_HIBRIDO_AUDIT.md` e `docs/ROADMAP_IMPLEMENTACAO.md`.

## O que é

PWA estático e pessoal: plano "Desafio Atleta Híbrido" + registro de treino, nutrição, hidratação, sono, peso e painel. Sem backend, sem conta, **sem dependências**. Dados no `localStorage` do aparelho.

## Layout

```
src/data/plan.js      conteúdo do plano (zonas com pace, corridas com `plain` = passo a passo, treinos, glossário)
src/data/help.js      perguntas frequentes e “como fazer” em linguagem simples
src/lib/              lógica pura + *.test.js ao lado (aiPrompt, nutrition, hydration, sleep, load, logs, profile, dashboard, heartRate, state…)
src/services/         storage (ÚNICO acesso ao localStorage), backup, exports (CSV)
src/store/store.js    estado, persistência, backup pré-migração
src/views/            home, train, nutrition, recovery, dashboard, tools — (state, ui, hoje) => string HTML
src/components/       html (esc, helpers), forms, sessionLog, helpBlocks (passo a passo, FAQ, painel da IA), charts (SVG), timer (DOM)
src/main.js           eventos (data-act / data-f / data-load …), validação → update()
src/styles/app.css    tokens + estilos; tokens.test.js garante contraste AA
docs/                 auditoria, roadmap/H2, QA e release
```

## Comandos

`npm run dev | test | build | preview` — `node --test src/lib/sleep.test.js` roda um arquivo.

## Regras

- **Zero dependências.** Não adicionar bibliotecas/frameworks sem justificativa documentada.
- **Regra de negócio só em `lib/`** (pura, com teste). Views não calculam; `main.js` só orquestra.
- **Validar toda entrada** com `validate*` antes de gravar; erros voltam ao formulário (`ui.errors`, `ui.draft`) com `role="alert"`.
- **Nunca** `localStorage` fora de `services/storage.js`. Mudou o formato do estado? Suba `STATE_VERSION`, ajuste `normalizeState`/`needsMigration`, mantenha migração sem perda e teste.
- **Cores só por tokens** em `app.css`; mudou uma cor? rode `tokens.test.js` (contraste AA).
- **Evidência antes de recomendação:** medição ≠ estimativa ≠ recomendação. Estimativas (bpm por fórmula, TMB, IMC, proteína) carregam rótulo e aviso. Sem prescrição clínica, sem pontuação de "prontidão", sem inferir dado faltante (lacuna ≠ zero).
- **Não embutir dados pessoais** (altura, peso etc.) no código; ficam no estado do usuário.
- Todo texto do usuário passa por `esc()`.
- **Texto para leigos:** nada de notação sem explicação (“3×”, “4 × 15”). Corridas com etapas repetidas em par precisam de `plain` com a ordem real. Ao criar uma sessão nova, escreva `plain` e teste em `help.test.js`.
- **IA externa:** `aiPrompt.js` só inclui conteúdo do plano, nunca dados pessoais; sem chave de API no front-end.
- Identificadores em inglês; textos visíveis em português.
- Não commitar `dist/`, segredos ou `.env`. Repositório deve ser privado.
- H2/backend: ver roadmap — não ligar o navegador ao H2; qualquer troca de persistência fica em `services/` + `store/`.

## Deploy

Vercel: `npm run build` → `dist/`. O build injeta no `sw.js` a lista de cache e um hash, e marca `app-env=production` no `index.html` (service worker só registra em produção).

## Créditos

Arquitetura inspirada no openGym (AGPL-3.0); nenhum código ou mídia copiado.
