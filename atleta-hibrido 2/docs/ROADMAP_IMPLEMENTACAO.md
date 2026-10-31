# Roadmap de implementação e decisões

Status em **v2.0.0**. Legenda: ✅ feito e testado · 🟡 parcial · ⏳ pendente.

## Plano por fase

| # | Fase | Status | Entregue / observação |
|---|---|---|---|
| 1 | Auditoria | ✅ | `ATLETA_HIBRIDO_AUDIT.md` |
| 2 | Plano técnico | ✅ | este documento |
| 3 | Design system | ✅ | Tokens azul/preto em `app.css`; **35 testes de contraste WCAG AA**; foco visível; alvos ≥ 44 px; `prefers-reduced-motion`; estados não dependem só de cor. Desvio: hover do botão primário `#1F5DB3` (o sugerido `#347FE5` dá só 3,95:1 com texto branco) — `#347FE5` ficou como `--color-primary-bright` |
| 4 | Corrida | ✅ | Objetivo/porquê/como executar; fases (aquecimento, principal, recuperação, desaquecimento); zonas por **RPE + teste da fala**, bpm sempre com método e rótulo "estimado · não calibrado" (ou "FCmáx medida"); cadência separada (spm, média/máx., sem valor universal); registro com RPE e observações; planejado × realizado sem penalizar |
| 5 | Nutrição | ✅ | Diário por data e refeição; porção/unidade/horário; kcal, P/C/G e fibra; marca de estimativa; favoritos; metas editáveis (vazias por padrão); histórico dia/semana/mês; CSV/JSON; referências (TMB, IMC, proteína) rotuladas como estimativa; aviso para meta < TMB |
| 6 | Hidratação | ✅ | ml por horário e contexto (antes/durante/depois/dia); meta configurável (sem padrão); histórico 7 dias; notas sobre eletrólitos sem dose. **Lembretes: ⏳** (ver pendências) |
| 7 | Sono/recuperação | ✅ | Dormir/acordar, duração, qualidade, sensação, fadiga, dor, descanso; semana com média, regularidade, dias de treino/descanso; carga interna (min × RPE); alertas **descritivos** |
| 8 | Persistência | 🟡 | Estado v2 versionado, validado e migrado de v1 com **backup automático** (`atleta-hibrido-v1-pre-v2-backup`); export JSON/CSV; **H2: não integrado** (decisão abaixo) |
| 9 | Dashboard | ✅ | 10 gráficos e 3 painéis (planejado × realizado, recordes, marcos), com período, unidade, fonte e lacunas; recordes; marcos. Sem "prontidão" |
| 10 | QA e documentação | ✅ | 189 testes; `QA_E_RELEASE.md` |
| — | Assistente (fase futura da skill) | ⏳ | Só após dados consistentes; não implementado |

## Avaliação do H2 (Fase 7 da skill)

**Situação verificada:** a aplicação é um site estático rodando no navegador; não há backend, JVM nem autenticação. O ambiente de desenvolvimento tinha Java 21, mas **sem o jar do H2 e sem rede** para baixá-lo — nada de H2 foi executado ou testado.

**Por que não conectar agora**
1. O navegador **não pode** abrir um banco H2 (JDBC/arquivo): é preciso um processo Java no meio.
2. A Vercel hospeda estáticos e funções *serverless*: sem JVM persistente e com sistema de arquivos **efêmero** — um arquivo H2 ali seria perdido e não seria compartilhado entre instâncias.
3. H2 embarcado serve bem a apps locais/de instância única; para multiusuário remoto exige instância única com disco persistente e backups.

**Opções**

| Opção | Quando faz sentido | Custo/risco |
|---|---|---|
| **A. Local-first (atual)** | Uso pessoal, um aparelho | Dados só no aparelho; mitigado por backup JSON/CSV |
| **B. Backend Java (Spring Boot) + H2 em arquivo** | Quer sync entre aparelhos **e** praticar Java/Spring | Precisa hospedar JVM com volume persistente (VPS/Fly/Railway), autenticação, CORS, backups, migrações (Flyway); instância única |
| **C. Postgres gerenciado (ex.: Supabase) via adaptador em `services/`** | Sync multi-aparelho com menos operação | Dependência de serviço externo; autenticação e regras de acesso por usuário |
| **D. IndexedDB (ou SQLite/WASM) no navegador** | Mais capacidade local que `localStorage` | Continua por aparelho |

**Recomendação:** manter **A** agora. Se precisar de sincronização, **C** é o caminho de menor manutenção; **B** é válido se o objetivo incluir aprender/operar um backend Java. Em qualquer caso, a troca é feita **apenas** em `services/` + `store/`, porque a lógica de domínio (`lib/`) é pura.

**Se escolher B** — requisitos da skill a cumprir: banco em arquivo (nunca `mem:`) em caminho persistente; Flyway; chaves estrangeiras/índices/transações; DTOs validados no servidor; consultas parametrizadas; credenciais por variável de ambiente; **H2 Console desabilitado em produção**; backup/restauração; testes de persistência após reinício. Rascunho de esquema inicial (**não executado, para revisar**):

```sql
CREATE TABLE user_profile (id UUID PRIMARY KEY, age INT, sex CHAR(1), height_cm DECIMAL(5,1), weight_kg DECIMAL(5,1),
  objective VARCHAR(20), restrictions VARCHAR(200), created_at TIMESTAMP WITH TIME ZONE NOT NULL, updated_at TIMESTAMP WITH TIME ZONE NOT NULL);
CREATE TABLE training_session (id UUID PRIMARY KEY, profile_id UUID NOT NULL REFERENCES user_profile(id) ON DELETE CASCADE,
  session_date DATE NOT NULL, kind VARCHAR(8) NOT NULL, plan_key VARCHAR(20) NOT NULL, duration_min INT, rpe SMALLINT,
  km DECIMAL(5,2), cadence_avg SMALLINT, cadence_max SMALLINT, notes VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL, updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
  CONSTRAINT uq_session UNIQUE (profile_id, session_date, kind, plan_key));
CREATE TABLE nutrition_entry (id UUID PRIMARY KEY, profile_id UUID NOT NULL REFERENCES user_profile(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL, entry_time TIME, meal VARCHAR(12) NOT NULL, name VARCHAR(80) NOT NULL, qty DECIMAL(8,1) NOT NULL, unit VARCHAR(8) NOT NULL,
  kcal DECIMAL(6,1), protein_g DECIMAL(6,1), carbs_g DECIMAL(6,1), fat_g DECIMAL(6,1), fiber_g DECIMAL(6,1), estimated BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL, updated_at TIMESTAMP WITH TIME ZONE NOT NULL);
CREATE INDEX ix_nutrition_day ON nutrition_entry(profile_id, entry_date);
-- hydration_entry, sleep_entry, body_measurement e goal seguem o mesmo padrão.
```

## Mapeamento do modelo lógico da skill → implementação atual

| Skill | Hoje (`state`) | Lacuna |
|---|---|---|
| `user_profile` | `profile` | — |
| `training_plan` | `data/plan.js` + `schedule` | plano é código, não dado editável |
| `training_session` | `logs` (+ `week.done`) | — |
| `exercise` | `LIFTS` em `plan.js` | sem catálogo editável |
| `exercise_set` | `week.sets` + `loads` + `loadHistory` | **sem reps/RPE/RIR por série** |
| `running_activity` | `logs` (kind `run`) | **sem pace, FC e zona por atividade** |
| `nutrition_entry` / `food_item` | `nutrition.entries` (composição na própria linha) + `favorites` | sem catálogo de alimentos |
| `hydration_entry` | `hydration.entries` | — |
| `sleep_entry` / `recovery_entry` | `sleep` (fadiga, dor e sensação no mesmo registro) | — |
| `body_measurement` | `body` | só peso |
| `goal` | `nutrition.goals`, `hydration.goalMl` | sem vigência/histórico de metas |

Datas de diário são chaves locais `AAAA-MM-DD`; `createdAt/updatedAt` em ISO/UTC. Unidades explícitas: kg, g, ml, km, min, bpm, spm.

## Pendências e riscos

1. **H2 / sincronização** — decisão do dono do produto (acima).
2. **Lembretes de hidratação** — exigem notificações/push (service worker + permissão); não implementado.
3. **Distribuição de intensidade da corrida** — não há dado por zona registrado; por isso **não** há gráfico (não se infere).
4. **RPE/RIR por série e pace/FC por corrida** — campos não capturados ainda.
5. **Lint e CI** — inexistentes; sugerido ESLint + GitHub Actions (`node --test`, `npm run build`).
6. **Teste em navegador real** — o ambiente de desenvolvimento não tinha navegador; veja o checklist manual.
7. **Assistente de performance** — apenas após meses de dados; deve pedir confirmação, mostrar dados usados e incerteza.
8. **`localStorage` tem limite (~5 MB)**: o app avisa se não conseguir gravar; para uso intenso por anos, migrar para IndexedDB (opção D).

## Critérios de aceite (por fase)

- Fluxo funciona executado (testes de integração em `src/main.test.js`).
- Dados persistem após recarregar (checklist manual) e migram da v1 sem perda (`state.test.js`).
- Validações e estados de erro com mensagem acessível (`views.test.js`, `main.test.js`).
- Contraste AA verificado por teste (`tokens.test.js`).
- Nenhuma recomendação de saúde como prescrição; estimativas rotuladas.
