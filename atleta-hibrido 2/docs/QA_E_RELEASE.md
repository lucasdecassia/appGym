# QA, limitações e checklist de release — v2.0.0

## Testes automatizados (resultado real desta versão)

`npm test` → **189 testes, 189 passando**.

| Camada | Arquivos | O que cobre |
|---|---|---|
| Domínio puro | `src/lib/*.test.js` | FC/zonas e calibração, 1RM, semana ISO, datas, nutrição (validação, somas, Mifflin–St Jeor, IMC, proteína), hidratação, sono (duração, regularidade), carga interna, logs, perfil/metas, estado e **migração v1 → v2**, painel, CSV |
| Serviços | `src/services/*.test.js` | storage (falhas), backup, exportações CSV |
| Componentes | `src/components/*.test.js` | escape de HTML, gráficos (lacunas, vazio, meta, acessibilidade) |
| Acessibilidade | `src/styles/tokens.test.js` | 35 verificações de contraste WCAG AA e ausência de cores literais |
| Telas | `src/views/views.test.js` | todas as telas, estados vazio/com dados, erro de formulário, escape |
| Integração | `src/main.test.js` | cliques e formulários reais (DOM simulado) contra o store |
| Build | `npm run build` | 42 arquivos; imports resolvidos; servidor responde 200 para todos |

**Não coberto por teste automatizado:** renderização visual em navegador, service worker/offline, instalação do PWA, leitores de tela, desempenho. Veja o checklist manual.

## Checklist manual (faça no celular após o deploy)

**Preservação (regressão)**
- [ ] Hoje, Treinos (Corrida, A, B, C, D) e Ferramentas abrem sem erro.
- [ ] Marcar séries, digitar carga, recarregar: continuam.
- [ ] Cronômetro ⏱ inicia, vibra/apita e aceita +15 s.
- [ ] Semana-tipo: trocar um dia e "Restaurar sugestão".
- [ ] Backup JSON: exportar e importar.
- [ ] Dados da v1 apareceram após atualizar (cargas, perfil, semana).

**Novos fluxos**
- [ ] Registrar corrida com distância, RPE e cadência → aparece no Painel.
- [ ] Alimento: adicionar, favoritar, reutilizar, excluir; metas; histórico semana/mês.
- [ ] Água: +200/+300/+500, volume livre, meta, exclusão.
- [ ] Sono: salvar, editar a mesma data, ver resumo semanal.
- [ ] Peso: adicionar e ver a linha.
- [ ] Perfil: preencher altura e peso → referências aparecem em Nutrição.
- [ ] CSV de treinos, nutrição, hidratação e sono abrem corretamente na planilha.

**Acessibilidade e responsividade**
- [ ] Navegação por teclado (Tab) com foco visível; formulários anunciam erros.
- [ ] Largura de 375 px sem rolagem horizontal; paisagem e desktop ok.
- [ ] Zoom do texto a 200 % sem perda de conteúdo.
- [ ] Sistema com "reduzir movimento" ligado.

**PWA**
- [ ] Instalar na tela inicial; abrir em tela cheia.
- [ ] Modo avião após a primeira visita: o app abre.
- [ ] Atualização: reabrir o app depois de um novo deploy mostra a versão nova.

## Limitações conhecidas

1. Dados por aparelho/navegador (sem sincronização); H2/backend **não** implementado (ver roadmap).
2. Zonas em bpm são estimativas por fórmula até o usuário informar uma FCmáx medida; mesmo assim são % da FCmáx, não limiares de lactato/ventilatórios.
3. Valores nutricionais são digitados pelo usuário; o app não tem base de alimentos.
4. Sem lembretes/notificações.
5. Sem RPE/RIR por série e sem pace/FC por corrida.
6. Dois conteúdos do plano original merecem conferência com o Time Híbrido: terra e stiff (4 séries × 5 valores de repetição) e fartlek (≈ 12 km).
7. Conteúdo informativo; não substitui acompanhamento de médico, nutricionista ou profissional de Educação Física.

## Checklist de release

- [ ] `npm test` e `npm run build` verdes localmente.
- [ ] Repositório **privado** (plano pessoal e intransferível).
- [ ] Vercel: Root Directory `atleta-hibrido`, Build `npm run build`, Output `dist`.
- [ ] Sem segredos no repositório (`git grep -i -E "token|secret|password"`).
- [ ] Checklist manual acima concluído.
- [ ] README e docs atualizados.
