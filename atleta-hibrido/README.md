# Atleta Híbrido · Meu Plano

App pessoal para acompanhar o **Desafio Atleta Híbrido** (Time Híbrido): corrida rumo aos 21 km + musculação 4×/semana (treinos A, B, C e D). Funciona no celular e no desktop, é instalável na tela inicial (PWA) e abre offline.

**O que faz**
- **Hoje:** treino do dia, semana em 7 dias, progresso em % e km.
- **Corrida:** 4 sessões com zonas Z1–Z5 e FC alvo em bpm (calculada pela sua FCmáx).
- **Treinos A–D:** séries marcáveis, carga em kg por exercício e cronômetro de descanso.
- **Ferramentas:** FCmáx/zonas, calculadora de 1RM (Epley), semana-tipo editável, glossário, backup JSON.

## Stack (decisão)

**Opção A — site estático, sem dependências.** O código de origem era HTML/CSS/JS puro, sem backend, então (KISS/YAGNI) não há framework nem `node_modules`: módulos ES nativos servidos direto pela Vercel. A organização segue as convenções do [openGym](https://github.com/DuarteSantos8/openGym) (lógica pura em `lib/` com teste ao lado, um store, uma view por tela, persistência isolada). Se um dia o app crescer, migrar para Vite + React é direto: `lib/`, `data/` e `services/` não dependem de DOM.

## Rodar localmente

Requer Node 20+ (nada para instalar).

```bash
npm run dev       # http://localhost:5173 (serve src/)
npm test          # testes (node --test)
npm run build     # gera dist/ (com service worker e lista de cache)
npm run preview   # http://localhost:4173 (serve dist/)
```

## Publicar na Vercel

1. Crie um repositório vazio no GitHub e envie o código:
   ```bash
   git remote add origin <url-do-repositorio>
   git push -u origin main
   ```
2. Em vercel.com: **Add New → Project** → importe o repositório.
3. Confira: Framework Preset **Other**, Build Command `npm run build`, Output Directory `dist` (já definidos em `vercel.json`) → **Deploy**.
4. A partir daí, cada `git push` publica sozinho.

Alternativa sem GitHub: `npx vercel` (preview) e `npx vercel --prod`.

## Dados

Tudo é salvo em `localStorage` (chave `atleta-hibrido-v1`), **por aparelho/navegador**: não sincroniza entre celular e PC e some se você limpar os dados do site. Use **Ferramentas → Exportar/Importar backup** para levar o progresso de um aparelho a outro. O progresso semanal zera sozinho toda segunda; cargas e perfil permanecem.

## Estrutura

```
src/
├── index.html, main.js          # entrada e eventos
├── data/plan.js                 # plano: zonas, corridas, treinos, glossário
├── lib/                         # lógica pura + *.test.js ao lado
├── services/                    # storage (único acesso ao localStorage) e backup
├── store/store.js               # estado + persistência
├── views/                       # uma tela por arquivo (string HTML pura)
├── components/                  # html helpers e cronômetro
├── styles/app.css, sw.js, manifest.webmanifest, icons/
scripts/                         # dev.mjs (servidor) e build.mjs (dist/)
```

## Pontos a conferir no plano original

- Terra e stiff: o slide mostra 4 séries com 5 valores de repetição.
- Fartlek 1:3: o slide mostra 3× (1 km Z3 + 3 km Z4), ≈ 12 km.
- Distribuição dos treinos nos dias da semana é sugestão, não faz parte do material.

## Aviso

Conteúdo informativo, não substitui acompanhamento profissional. Faça um check-up médico antes de iniciar. Plano pessoal e intransferível do Time Híbrido — não compartilhe nem revenda o conteúdo.
