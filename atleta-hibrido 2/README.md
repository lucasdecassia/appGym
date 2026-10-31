# Atleta Híbrido

App pessoal do **Desafio Atleta Híbrido** (Time Híbrido) para treinar, registrar e acompanhar a evolução: corrida por zonas, musculação A/B/C/D, nutrição, hidratação, sono/recuperação e painel de indicadores. PWA instalável, abre offline, sem dependências e sem backend.

## O que tem (v2.0.0)

- **Hoje:** treino do dia com objetivo e registro (duração, RPE, cadência, observações), planejado × realizado e resumo de água/kcal/sono.
- **Treinos:** corrida com fases, zonas Z1–Z5 por **RPE + teste da fala** (bpm sempre com o método e marcado como estimado até medir a FCmáx), cadência separada; força com séries marcáveis, cargas, histórico/recordes e cronômetro de descanso.
- **Nutrição:** diário por refeição, kcal/macros, favoritos, metas editáveis, histórico dia/semana/mês e referências (metabolismo basal, IMC, proteína) rotuladas como estimativa.
- **Hidratação:** ml por contexto, meta configurável e histórico.
- **Recuperação:** sono, fadiga, dor, descanso, regularidade, carga interna (min × RPE) e peso corporal.
- **Painel:** gráficos com período, unidade, fonte e lacunas (nunca zeros inventados), recordes e marcos.
- **Dados:** backup JSON, CSV (treinos, nutrição, hidratação, sono) e migração automática da v1 com backup.
- **Visual:** identidade azul e preto com tokens centralizados e contraste AA verificado por teste.

## Stack

Site estático, JavaScript com módulos ES nativos, **zero dependências** (KISS/YAGNI). Organização inspirada no [openGym](https://github.com/DuarteSantos8/openGym): lógica pura em `lib/` com teste ao lado, store único, uma tela por arquivo, persistência isolada em `services/`. Nenhum código ou mídia do openGym (AGPL-3.0) foi copiado.

## Rodar localmente (Node 20+, nada para instalar)

```bash
npm run dev       # http://localhost:5173
npm test          # 189 testes (node --test)
npm run build     # gera dist/
npm run preview   # http://localhost:4173
```

## Publicar na Vercel

Repositório **privado** no GitHub → Vercel *Add New → Project* → Root Directory (se o projeto estiver numa subpasta) → Framework *Other*, Build `npm run build`, Output `dist` (já em `vercel.json`) → Deploy. Cada `git push` publica sozinho.

## Dados e privacidade

Tudo fica no `localStorage` **deste aparelho** (chave `atleta-hibrido-v1`); não há conta nem envio para servidor. Altura, peso e demais dados pessoais são digitados por você e não estão no código. Exporte backups regularmente. Sincronização entre aparelhos e a avaliação do **H2** estão em [`docs/ROADMAP_IMPLEMENTACAO.md`](docs/ROADMAP_IMPLEMENTACAO.md).

## Documentação

- [`docs/ATLETA_HIBRIDO_AUDIT.md`](docs/ATLETA_HIBRIDO_AUDIT.md) — auditoria do que existia
- [`docs/ROADMAP_IMPLEMENTACAO.md`](docs/ROADMAP_IMPLEMENTACAO.md) — fases, modelo de dados, H2, pendências
- [`docs/QA_E_RELEASE.md`](docs/QA_E_RELEASE.md) — testes, checklist manual, limitações
- [`CLAUDE.md`](CLAUDE.md) — guia para agentes

## Aviso

Conteúdo informativo; não substitui médico, nutricionista ou profissional de Educação Física. Faça um check-up antes de iniciar e pare se sentir dor, tontura ou falta de ar anormal. Plano pessoal e intransferível do Time Híbrido — não compartilhe nem revenda.
