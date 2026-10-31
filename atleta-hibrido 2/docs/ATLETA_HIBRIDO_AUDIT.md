# Auditoria — Atleta Híbrido (Fase 0)

> Escopo: código do projeto `atleta-hibrido/` como estava na v1.0.0 (ponto de partida desta evolução). O repositório remoto `lucasdecassia/appGym` não pôde ser aberto pelo agente (acesso automatizado bloqueado pelo GitHub); a auditoria foi feita na cópia local que originou o que foi enviado. Tudo abaixo foi **observado**, não presumido.

## Arquitetura observada (v1.0.0)

| Item | Observação | Evidência |
|---|---|---|
| Tipo | PWA estático, sem backend, sem login, sem API | `find src scripts` → só `.js/.css/.html`; nenhum `fetch` para API própria |
| Linguagem | JavaScript (módulos ES nativos), CSS e HTML puros; sem TypeScript | arquivos `.js` com `import/export` |
| Dependências | **Nenhuma** (runtime e dev) | `package.json` sem `dependencies`/`devDependencies` |
| Build | `scripts/build.mjs` copia `src/` → `dist/`, injeta lista de cache e hash no `sw.js` | execução do `npm run build` |
| Testes | `node --test` (nativo). 53 testes na v1 | `node --test` → 53 pass |
| Lint / CI | **Não há** linter nem CI configurados | ausência de configuração |
| Persistência | `localStorage` (chave `atleta-hibrido-v1`) por aparelho; acesso isolado em `services/storage.js` | `grep localStorage` → só `storage.js` |
| Estado | Store único (`store/store.js`) com `update()`, `subscribe()` | leitura do código |
| UI | Telas como funções `(state, ui) => string HTML`; eventos delegados em `main.js` | leitura do código |
| Rotas | Não há: 4 abas em memória (Hoje, Corrida, Treinos, Ferramentas) | `main.js` |
| Design system | Tokens parciais (variáveis CSS verdes) | `styles/app.css` v1 |
| Deploy | Vercel (`vercel.json`: build `npm run build`, saída `dist`), Root Directory = `atleta-hibrido` no repositório `appGym` | conversa com o usuário |

## Funcionalidades existentes que devem ser preservadas

1. Plano do Desafio Atleta Híbrido: 4 sessões de corrida (intervalado, contínuo ×2, fartlek) e 4 treinos de força (A, B, C, D) com blocos, métodos, séries, repetições e pausas.
2. Semana-tipo editável (corrida/força por dia) e restauração da sugestão.
3. Marcação de séries, carga por exercício, cronômetro de descanso (vibra e apita).
4. Progresso semanal (% e km) com reset automático na segunda-feira; cargas permanecem.
5. FCmáx (Tanaka/Haskell e Fox/medida) e zonas Z1–Z5.
6. Calculadora de 1RM (Epley).
7. Backup JSON (exportar/importar).
8. PWA instalável, offline após a primeira visita.

## Problemas confirmados

| # | Problema | Evidência | Tratamento |
|---|---|---|---|
| P1 | Zonas mostravam bpm "fixos" sem sinalizar que vinham de fórmula por idade | `zoneLabel` exibia só `113–132 bpm` | Fase 2: rótulo "estimado · não calibrado", RPE e teste da fala em primeiro plano |
| P2 | Nenhum registro de sessão (RPE, observações, duração, cadência); só um "concluído" | modelo `week.done` | Fase 2: `logs` com validação |
| P3 | Sem nutrição, hidratação, sono, peso, histórico ou painel | ausência no código | Fases 3–6 |
| P4 | Dados só na semana corrente (progresso) — sem histórico de longo prazo | `emptyWeek` zera `done/sets` | `logs`, `loadHistory` e coleções datadas |
| P5 | Paleta verde, tokens incompletos, cores literais em componentes | `app.css` v1 | Fase 1: tokens azul/preto + teste automático de contraste |
| P6 | Sem lint, sem CI | — | Pendência documentada (ver roadmap) |
| P7 | Dados no aparelho; limpeza do navegador apaga tudo | `localStorage` | Backup JSON/CSV e backup automático pré-migração; H2 avaliado (ver roadmap) |

## Riscos e decisões em aberto

- **H2 × stack atual:** o H2 roda na JVM; o app é estático (sem backend) e a Vercel não executa JVM persistente. Detalhes e opções em `ROADMAP_IMPLEMENTACAO.md`. **Decisão pendente do dono do produto.**
- **Cálculo divergente na skill:** a equação de Mifflin–St Jeor para homem, 84 kg, 178 cm, 28 anos dá **1.817,5 kcal** (arredondado: 1.818), e não 1.808 como escrito no texto de referência. O app usa a fórmula (testada). IMC (26,5) e faixa de proteína (118–168 g) conferem.
- **Dados pessoais no código:** altura, peso e sexo informados na skill **não** foram embutidos no código-fonte (o repositório estava público). O usuário os digita em *Ferramentas → Perfil*; ficam só no aparelho.
- **Conteúdo do Time Híbrido:** plano de uso pessoal e intransferível; repositório deve ser privado.
- **openGym (AGPL-3.0):** usado só como referência de arquitetura/produto; nenhum código ou mídia copiado.

## Arquivos afetados pela evolução

`src/data/plan.js`, `src/lib/*` (novos: dates, ids, csv, nutrition, hydration, sleep, load, logs, profile, dashboard; alterados: state, heartRate, exercises), `src/services/exports.js`, `src/store/store.js`, `src/components/*` (forms, sessionLog, charts), `src/views/*` (train, nutrition, recovery, dashboard; home e tools reescritos), `src/styles/app.css`, `src/main.js`, `src/index.html`, `src/manifest.webmanifest`, ícones, `docs/*`, `README.md`, `CLAUDE.md`.
