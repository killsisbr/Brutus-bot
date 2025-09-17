# Front-end & Dashboard — Estrutura e melhorias

Este documento descreve a estrutura proposta para o painel (front-end) do projeto, fluxo de dados, lista de melhorias UX/UI, arquitetura de componentes e próximas etapas para implementação.

## Objetivo
- Ter um painel web moderno e confiável que mostre pedidos (carrinhos), conversas e estatísticas em tempo real.
- Permitir ações administrativas (alterar estado, resetar carrinho, ver histórico de mensagens, atribuir a atendente, abrir chat via wa.me).
- Ser responsivo, acessível e fácil de manter.

## Checklist (entregáveis imediatos)
- [x] Página `public/pedidos.html` que mostra carrinhos em tempo real via Socket.IO (implementado).
- [ ] Histórico de conversas por cliente integrado ao painel.
- [ ] Página de detalhes do pedido (modal ou rota) com conversa e timeline de eventos.
- [ ] Busca/Filtragem (por número, estado, aberto/fechado).
- [ ] Visual polish: cores, tipografia, cartões com status visual, badges de notificação.
- [ ] Ações rápidas: abrir chat, transferir para humano, imprimir, marcar como entregue.
- [ ] Testes básicos de integração e e2e (smoke tests).

## Páginas / Rotas propostas
- `/pedidos` — Lista de conversas/carrinhos em tempo real (já criada).
- `/pedidos/:id` — Detalhes do pedido: histórico de mensagens, itens do carrinho, eventos (criado, modificado, impresso), controles (reset, mudar estado, imprimir).
- `/painel-mensagens` — CRUD de mensagens/ gatilhos (já existe).
- `/estatisticas` — Gráficos simples (volume por hora, itens mais pedidos, gatilhos mais usados).
- `/login` (opcional) — Autenticação básica para acesso ao painel.

## Principais componentes UI
- Header global com pesquisa rápida e filtros.
- Cards responsivos para cada cliente/pedido (nome, número, estado, total, último evento, badges).
- Painel lateral (drawer) com detalhes: histórico de mensagens, timeline, botões de ação.
- Modal de confirmação para ações destrutivas (reset, limpar carrinho, imprimir).
- Toasts/alerts para feedback de ações (ACKs de Socket.IO).

## Fluxo de dados (resumo técnico)
- Server -> Client (dashboard):
  - Evento inicial: `initial` { carrinhos }
  - Atualizações em tempo real: `carrinho:update` { id, carrinho, tipo? }
  - Acks de comando: `admin:ack` { ok, id, state }
- Client -> Server (dashboard):
  - `admin:setState` { id, state }
  - `admin:reset` { id }
  - (futuros) `admin:print` { id }

- Backend: eventos do `carrinhoService.events.emit('update', payload)` devem padronizar payloads com uma propriedade `type` e `id` (ex.: `{ type: 'update'|'message'|'print'|'reset', id, carrinho, message }`).

## Mudanças recomendadas no servidor para facilitar o front
- Padronizar payloads emitidos por `events.on('update', ...)`:
  - Use { type, id, carrinho?, message?, timestamp?, delta? }
  - Assim o cliente diferencia `message` vs `carrinho` vs `state_change` e renderiza apropriadamente.
- Em `bot.js`, ao receber mensagens, emitir também `events.emit('update', { type: 'message', id, message, from, timestamp })`.
- Persistir histórico mínimo (append em memória + salvar em DB/sqlite) para mostrar na aba `/pedidos/:id` após reload.

## UX / Visual Improvements (prioridade alta → baixa)
1. Visual status colorido: mapear estados para cores (ex.: `menu-inicial` → verde, `confirmandoPedido` → amarelo, `finalizado` → cinza). Mostrar badge no card.
2. Notificações sonoras para novos pedidos ou mensagens (opcional, com toggle).
3. Realce (pulse) para pedidos novos/sem atendimento.
4. Filtros rápidos: somente novos, anexos (localização/imagem), entregues, por tempo.
5. Ordenação: por último evento, por valor, por número.
6. Painel de detalhe com timeline e possibilidade de reenviar mensagens ou copiar conteúdo.
7. Mobile-first: cards empilháveis e botões grandes; ou layout adaptativo para tablet/desktop.
8. Tema claro/escuro configurável.

## Performance e escalabilidade
- Começar simples: Socket.IO direto no processo Node atual (já feito).
- Se crescer: externalizar via Redis/pubsub e escalar múltiplos workers.
- Limitar tamanho do histórico mantido em memória (ex.: guardar últimas 200 mensagens por cliente) e truncar/compactar em DB.

## Segurança e controle de acesso
- Implementar uma camada de autenticação mínima (API key ou login simples) para a rota de admin/painel.
- Proteger endpoints REST com verificação de token (middleware Express).

## Design System e componentes reutilizáveis
- Criar um pequeno Design System (cores, tipografia, espaçamentos, tokens de UI) em `public/css/style.css` e componentes JS simples (renderers de card).
- Usar vanilla JS inicialmente (já usado no projeto) ou migrar para Svelte/React/Vue se planejar reusabilidade maior.

## Testes e qualidade
- Linhas de teste sugeridas:
  - Smoke test: iniciar bot + conexão Socket.IO + receber evento `initial`.
  - E2E simples: abrir `/pedidos`, simular `carrinho:update` e verificar DOM.
- Sugestão: adicionar script npm `test:smoke` que executa Node script de verificação.

## Implementação passo-a-passo (muito prática)
1. Padronizar payloads emitidos pelo `events` no backend (refactor curto no `carrinhoService` e `bot.js`).
2. Persistir mensagens recebidas: gravar em memória e salvar no DB (sqlite/sql.js) — criar API `GET /api/pedidos/:id` para recuperar histórico e carrinho.
3. Expandir `public/pedidos.html` para suportar abrir detalhe (fetch `/api/pedidos/:id`) e renderizar timeline.
4. Adicionar filtros e pesquisa no front (client-side).
5. Melhorar styling (CSS) e adicionar toasts/alerts.
6. Adicionar autenticação básica para /pedidos e /painel-mensagens.

## Exemplo de payload padrão (recomendado)
```json
{ "type": "update", "id": "554191798537@s.whatsapp.net", "carrinho": { "carrinho": [], "estado": "menu-inicial", "valorTotal": 0 }, "timestamp": 1693910400000 }

{ "type": "message", "id": "554191798537@s.whatsapp.net", "message": { "from": "554191798537@s.whatsapp.net", "text": "oi", "timestamp": 1693910401000 } }
```

## Tarefas de curto prazo que eu posso executar agora
- [ ] Padronizar `events.emit('update', ...)` no backend e emitir `type: 'message'` ao receber msgs.
- [ ] Adicionar endpoint `GET /api/pedidos/:id` para recuperar carrinho + mensagens (pequeno patch).
- [ ] Melhorar `public/pedidos.html` para suportar abrir detalhes (modal / fetch) — incluir histórico.

Se você concordar, eu começo padronizando os eventos e adicionando o endpoint `GET /api/pedidos/:id` para que o painel mostre o histórico por cliente. Qual dessas tarefas prefere que eu execute primeiro?
