# CLAUDE.md

Guia para agentes de IA (Claude Code etc.) que trabalhem neste repositório.

## O que é

PWA estático e pessoal do plano "Desafio Atleta Híbrido": corrida (zonas de FC) + musculação (treinos A–D). Sem backend, sem conta, sem dependências de runtime. Dados só no `localStorage` do aparelho.

## Layout

```
src/data/       plan.js — todo o conteúdo do plano (zonas, corridas, treinos, glossário)
src/lib/        lógica pura (FC, 1RM, semana ISO, progresso, estado) — cada arquivo tem *.test.js ao lado
src/services/   storage.js (ÚNICO acesso ao localStorage) e backup.js
src/store/      store.js — estado + persistência + subscribe
src/views/      home, run, lift, tools — funções (state, ui) => string HTML, sem DOM
src/components/ html.js (esc e helpers de marcação), timer.js (DOM)
src/main.js     delegação de eventos (data-act / data-load / data-profile / data-sched) e render
scripts/        dev.mjs e build.mjs (zero dependências)
```

## Comandos

```
npm run dev | test | build | preview
npx node --test src/lib/heartRate.test.js   # um arquivo
node --test --test-name-pattern="Epley"     # um teste
```

Não há linter nem TypeScript: siga o estilo existente.

## Regras

- **Zero dependências** é restrição dura (KISS/YAGNI). Não adicionar bibliotecas, framework ou estado global.
- **Lógica que decide algo** (FC, cargas, progresso, reset semanal, backup) vive em `lib/`/`services/` como função pura **com teste ao lado**; não basta clicar para verificar.
- **Nunca** chamar `localStorage` fora de `services/storage.js`.
- Todo texto de usuário passa por `esc()` nas views.
- Identificadores em inglês; textos visíveis em português.
- Mudou o plano? Edite só `src/data/plan.js` e rode `npm test` (há testes de totais de km e de exercícios por treino).
- Ao mudar o formato do estado, ajuste `normalizeState` e `STATE_VERSION` em `lib/state.js` mantendo compatibilidade com dados antigos.
- Não commitar `dist/`, segredos ou `.env`.

## Deploy

Vercel lê `vercel.json`: `npm run build` → `dist/`. O build injeta no `sw.js` a lista de arquivos e um hash de versão, e marca `app-env=production` no `index.html` (o service worker só registra em produção).

## Créditos

Convenções de arquitetura inspiradas no openGym (AGPL-3.0). Nenhum código ou mídia dele foi copiado.
