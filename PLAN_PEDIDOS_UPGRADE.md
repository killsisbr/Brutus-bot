# Plano: Upgrade do `public/pedidos.html`

Objetivo
- Consolidar melhorias de UX, robustez e manutenibilidade do painel `public/pedidos.html` sem quebrar a base atual.

Resumo do que vou cobrir
- Checklist de requisitos (explicitados e implícitos)
- Contrato pequeno (entradas/saídas/erros)
- Problemas atuais observados
- Mudanças propostas (priorizadas)
- Passo-a-passo de implementação (pequenas entregas)
- Testes / qualidade / rollout

## Checklist (requisitos)
- [ ] Mostrar carrinhos em tempo real sem duplicar mensagens. (Done/validação)
- [ ] Modal de conversa com: histórico de mensagens, inputs para envio, visão do carrinho, botões de ação (reset, limpar, adicionar, finalizar). (Manter)
- [ ] `Finalizar` deve emitir `admin:finalizarCarrinho` e aguardar ack; bot deve processar como se fosse cliente. (Done)
- [ ] Permitir adicionar bebidas/itens via admin por nome e por id. (Done; mapa parcial no front-end)
- [ ] Atualizar quantidades (+/−) do modal e refletir em tempo real. (Done)
- [ ] Evitar falsos-positivos em gatilhos/parsings (normalização). (Recomendado)
- [ ] Feedback visual para o operador durante ações admin (disable, spinner, toast). (Pendente)
- [ ] Lógica de agregação de itens no UI deve mapear corretamente para índices reais no backend quando houver múltiplos itens idênticos. (Melhoria)
- [ ] Centralizar mapas (bebidas/lanches) para evitar divergência front/back. (Melhoria)
- [ ] Cobertura mínima de testes para parser de itens e mapa de bebidas. (Opcional, recomendado)

## Contrato (pequeno)
- Inputs: eventos socket (`carrinho:update`, `admin:ack`), ações do operador (emit `admin:*`).
- Outputs: emits socket para o servidor (`admin:addItem`, `admin:updateQuantity`, `admin:finalizarCarrinho`, etc.) e render do DOM.
- Erros/limitações: UI deve lidar com falta de `valorTotal`, índices inconsistentes, e mensagens atrasadas.

## Principais problemas observados
- O front-end mantém um mini-mapa de bebidas que pode divergir do backend e já causou mapeamentos errados no passado.
- Botões +/− no card estavam apenas visuais em alguns lugares; apenas o modal atual tem handlers que usam `findIndex`, o que falha se houver duplicatas idênticas (pega sempre o primeiro índice).
- Falta de feedback visual ao usuário do painel durante ações admin leva a cliques duplicados/erros.
- Normalização de gatilhos e palavras é inconsistência (causa falsos positivos).
- Cálculo de `valor` exibido dependia de `data.valorTotal`, que pode ficar desatualizado; já foi melhorado no modal, mas precisa unificação de lógica.

## Mudanças propostas (prioridade alta → baixa)
1. UX & segurança das ações (alta)
   - Implementar ack flow: desabilitar botões relevantes enquanto não chega `admin:ack` e mostrar toast/sinal visual ao término.
   - Adicionar debounce + in-flight flags para evitar duplicate emits.
2. Correção de mapeamento e centralização (alta)
   - Remover o mini-mapa duplicado do front-end; consultar o servidor para resolver `itemName -> itemId` (emit `admin:resolveName` ou reutilizar `admin:addItem` com texto e deixar o servidor processar).
   - Se manter mapa no cliente, extrair para `public/js/mapas.js` e importar nas páginas para facilitar sincronização.
3. Robustez da atualização de quantidades (alta)
   - Alterar fluxo para operar em IDs de item persistentes (cada item no backend terá um identificador único local dentro do carrinho, ex: `uid`); o front-end renderiza agregados e emite alterações com esse `uid` para evitar ambiguidade.
   - Alternativa menos intrusiva: quando emitir update de quantidade, enviar também um checksum (nome+preco+preparo+timestamp) ou `instanceIndex` calculado no backend e retornado no `carrinho:update` (reconciliação). 
4. Refactor JS (média)
   - Separar scripts de `public/pedidos.html` em `public/js/pedidos.js` para organizar handlers, helpers (normalize, limparTexto), e testes.
   - Usar pequenas funções puras para normalização e geração de regex seguros.
5. Normalização e matching (média)
   - Implementar função `normalizeText()` e `escapeForRegex()` compartilhada pelo backend e frontend (mesmo algoritmo: lowercase, strip pontuação básica, replace diacríticos), para reduzir falsos positivos em gatilhos.
6. Feedback visual e acessibilidade (baixa)
   - Melhorar foco/teclas (Enter envia), aria-labels, e cores de alto contraste para botões críticos.
7. Testes e CI (opcional)
   - Adicionar um script simples `scripts/test-gatilhos.js` e testes unitários para `analisePalavras` e `mapaBebidas`.

## Passo-a-passo implementável (sprints curtas)
- Sprint A (1-2 horas)
  1. Implementar ack flow no front-end: in-flight flags, disable finalizer/add/remove while pending; exibir toast no `admin:ack`.
  2. Mover a mini-lógica de `limparTexto()` e `mapaBebidas` para `public/js/pedidos.js`.
  3. Validar com um teste manual: adicionar bebida via painel, ver ack e UI bloqueio.
- Sprint B (2-4 horas)
  1. Remover mini-mapa e alterar `addItemByName` para sempre enviar `admin:addItem` com `itemName` e deixar o backend resolver; o backend aceitará `itemId` ou `itemName`.
  2. Ajustar backend (`bot.js`/`carrinhoService`) para priorizar `itemId` if provided, else parse `itemName` using existing analisador.
- Sprint C (4-8 horas)
  1. Implementar ID único por item no carrinho (backend) e propagar `uid` no `carrinho:update` payload.
  2. Atualizar front-end para usar `uid` em emits `admin:updateQuantity` e `admin:removeItem`.
- Sprint D (opcional)
  1. Escrever testes unitários e adicionar script `npm run test-gatilhos` simples.

## Arquivos a alterar
- `public/pedidos.html` → extrair/alterar UI e handlers; adicionar data-attributes para flags
- `public/js/pedidos.js` (novo) → mover todo o script inline
- `src/services/carrinhoService.js` → (opcional) gerar e expor `uid` por item e aceitar update por `uid`
- `bot.js` → aceitar `admin:addItem` com `itemName` ou `itemId`; melhorar `verificarGatilhosPersonalizados` (normalização)
- `src/utils/mapaBebidas.js` → manter fonte de verdade e possivelmente exportar um endpoint HTTP `/api/mapa-bebidas` se quisermos o front-end sincronizado
- `scripts/test-gatilhos.js` (novo) → script rápido para validar matching

## Edge cases a tratar
- Múltiplos itens idênticos: o front-end agrupa por (id,preparo,nome) e perde a referência ao índice correto — usar `uid` evita ambiguidade.
- Ações simultâneas de operadores concorrentes: usar optimistic UI com reconciliação do servidor via `carrinho:update` e in-flight tokens.
- Triggers com caracteres regex: sempre escapar antes de criar regex.
- Mensagens muito longas ou com emojis: normalizar removendo emojis para matching (ou manter se necessário); documentar tradeoffs.

## Métricas/checagens após deploy
- Validação manual: 10 casos de uso (adicionar bebida, adicionar lanche, trocar qtd, finalizar, reset)
- Tempo de latência do ack (média e p95)
- Contagem de ocorrências de falsos-positivos em gatilhos (monitoramento via logs)

## Próximos passos imediatos (para eu implementar)
- Implementar Sprint A: ack UI + mover script para `public/js/pedidos.js`.
- Testar localmente (iniciar `node bot.js`, abrir `http://localhost:3001/pedidos` e executar ações).

---
Marca esta issue como pronta para discussão; se concordar eu começo pela Sprint A e aplico patches pequenos e validados.
