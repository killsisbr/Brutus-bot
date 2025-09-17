# Análise Completa do Codebase: Brutus Burger Bot

## 1. Visão Geral do Projeto
O codebase é um sistema de bot para WhatsApp focado em automação de pedidos para o restaurante Brutus Burger. É construído em Node.js, com integração via `whatsapp-web.js` para comunicação em tempo real, um painel administrativo web via Express e Socket.IO, e persistência em SQLite. O foco é em parsing de mensagens do cliente para itens do cardápio, gerenciamento de carrinhos, e ações administrativas como adicionar/remover itens e finalizar pedidos.

- **Objetivo Principal**: Facilitar pedidos via chat, persistir dados de clientes, e permitir monitoramento/controle via painel web.
- **Escopo**: Low-to-medium scale (in-memory carrinhos, DB simples); adequado para um restaurante pequeno.
- **Versão/Estado**: Evoluído iterativamente (logs mostram correções recentes em mapeamentos, gatilhos e UI).
- **Tech Stack**:
  - Runtime: Node.js (v18+ presumido).
  - Web/Real-time: Express, Socket.IO.
  - WhatsApp: whatsapp-web.js (com Puppeteer para headless browser).
  - DB: SQL.js (SQLite in-memory, salvo em `~/AppData/ROBO-BOT/clientes.db`).
  - Outros: qrcode-terminal, pdf-to-printer (para impressão de pedidos), fs/path para arquivos locais (cardápio imagens, mensagens JSON).
- **Dependências (de package.json presumido)**: whatsapp-web.js, socket.io, express, sql.js, puppeteer, qrcode, pdfkit/pdf-to-printer.
- **Execução**: `node bot.js` inicializa servidor (porta 3001 para dashboard), WhatsApp client, e listeners de mensagens.

## 2. Estrutura do Codebase
O projeto segue uma estrutura modular, com separação clara entre core logic, serviços, utils e assets públicos. Baseado na árvore de arquivos:

```
bot.js (entrada principal)
├── package.json (deps e scripts)
├── public/
│   ├── pedidos.html (painel admin: cards de carrinhos, modal conversa)
│   └── admin.html (gerenciamento de gatilhos/mensagens)
├── src/
│   ├── core/
│   │   ├── analisePalavras.js (parsing de itens, bebidas, lanches)
│   │   ├── analisePorStatus.js (roteamento por estado do carrinho)
│   │   └── fluxo/ (menus: menuGlobal.js, menuEndereço.js, menuPagamento.js, etc.)
│   ├── services/
│   │   ├── carrinhoService.js (gerencia carrinhos in-memory, eventos, add/remove/update)
│   │   └── clienteService.js (DB clientes: nome, endereço, histórico, gasto total)
│   └── utils/
│       ├── cardapio.js (array de itens com id, nome, preço, descrição)
│       ├── mapaLanches.js / mapaBebidas.js (mapeamentos nome → id)
│       ├── mensagens.js (templates de respostas)
│       └── outros (mapaNumeros.js, obterResposta.js)
├── bin/ (mensagens JSON, SumatraPDF para impressão)
├── data/ (gatilhos.json, possivelmente backups)
└── cardapio*.jpg (imagens do menu)
```

- **Tamanho**: ~20 arquivos principais; codebase compacto (~5k LOC estimado).
- **Padrões**: Modular (require/export), eventos (EventEmitter em carrinhoService), single-source-of-truth para mensagens (via whatsapp client events).

## 3. Componentes Chave
### Backend (bot.js e Core)
- **Inicialização**: `bot.js` carrega serviços, inicializa WhatsApp client (com auth local), servidor Express (rotas /pedidos, /api/gatilhos), e Socket.IO para admin.
- **Parsing de Mensagens** (`analisePalavras.js`):
  - `separarMensagem`: Limpa e split texto.
  - `processarLanches/Bebidas`: Usa mapas para mapear nomes → ID (ex: 'coca lata' → 31), extrai quantidade/preparo via regex.
  - `analisarPalavras`: Chama processadores, adiciona ao carrinho via `adicionarItemAoCarrinho`, emite eventos.
  - Gatilhos: `verificarGatilhosPersonalizados` (normaliza e match com palavras salvos; recente melhoria com boundaries).
- **Fluxos de Menu** (`fluxo/menuGlobal.js` e afins):
  - Estados: `menuInicial` (parse itens), `menuEndereço` (valida/reutiliza endereço, calcula entrega), `menuPagamento` (PIX/troco), `menuFinalizado` (confirma total).
  - Validações: Checa dados obrigatórios (nome, endereço, ponto carne); limpa DB inválido.
- **Serviços**:
  - `carrinhoService.js`: In-memory `carrinhos[id]`, funções add/remove/update quantity, `valorTotal` (itens + entrega), eventos para Socket.IO.
  - `clienteService.js`: CRUD em DB (salva endereço, histórico, gasto); migrações auto.
- **Handlers Socket.IO** (`bot.js`): `admin:addItem`, `admin:removeItem`, `admin:updateQuantity`, `admin:finalizarCarrinho` (simula fluxo cliente), `admin:sendMessage`.
- **Persistência/Impressão**: Salva PDF/HTML de pedidos via Puppeteer; imprime com pdf-to-printer.

### Frontend (public/pedidos.html)
- **UI**: Grid de cards com carrinhos agregados (nome, estado, total calculado localmente), input para add item, botões (reset, limpar, conversa, finalizar).
- **Modal Conversa**: Histórico mensagens, carrinho com +/−/remover, input envio, ações rápidas.
- **JS Inline**: Socket listeners (`carrinho:update` re-renderiza), funções para emit (addItemByName com mini-mapa bebidas), cálculo total local.
- **Melhorias Recentes**: Agregação itens, ícones, ack feedback, +/− funcional.

### Utils e Assets
- Mapas: `mapaLanches.js`/`mapaBebidas.js` (nome → id; corrigidos recentemente para evitar "ID não encontrado").
- Mensagens: Templates em `mensagens.js` (ex: saudação personalizada).
- Cardápio: Array fixo em `cardapio.js` (itens com preço/descrição).

## 4. Fluxos de Execução Principais
### Fluxo de Pedido Cliente
1. Mensagem recebida → `client.on('message_create')` em `bot.js`.
2. `analisePorStatus` roteia por estado (`menuInicial` → `analisePalavras`).
3. Parsing: Extrai itens → `adicionarItemAoCarrinho` → emite `update`.
4. Resumo: `carrinhoView` envia via `reply`.
5. Finalizar: Valida dados → calcula total → salva DB/histórico → gera PDF/imprime.
6. Gatilhos: Antes de parsing, `verificarGatilhosPersonalizados` checa match → responde auto se true.

### Fluxo Admin
1. Conecta Socket.IO → recebe `initial` com carrinhos.
2. Ação (ex: add item) → emit `admin:addItem` → backend chama serviço → emite `carrinho:update` → re-render UI.
3. Modal: Re-render em updates; +/− emite `admin:updateQuantity` → backend atualiza → ack + update.

### Inicialização
- `node bot.js`: Carrega DB, WhatsApp client (QR/auth), servidor Express/Socket, listeners.
- DB: Cria tabelas clientes/gatilhos; migra colunas (total_gasto, histórico).

## 5. Dependências e Configurações
- **Pacotes NPM**: whatsapp-web.js (core), socket.io, express, sql.js, puppeteer (PDF), qrcode-terminal.
- **Config**: Caminho DB em appData; Chrome path para Puppeteer; porta 3001 para dashboard.
- **Ambientes**: Windows-focused (PowerShell, caminhos AppData); assume Chrome instalado.
- **Segurança**: Sem auth no socket (exposição interna); auth WhatsApp via LocalAuth.

## 6. Pontos Fortes
- **Modularidade**: Separação clara (core/services/utils); fácil adicionar itens/menus.
- **Real-Time**: Socket.IO sincroniza bot/painel instantaneamente.
- **Persistência Inteligente**: Reutiliza dados cliente (endereço, nome); histórico/gasto para personalização.
- **Parsing Robusto**: Regex + mapas lidam com variações comuns; gatilhos para automação.
- **Admin Eficiente**: Painel simples, ações rápidas (add/finalizar via simulação de cliente).

## 7. Limitações e Problemas Identificados
- **Parsing Frágil**: Dependente de mapas fixos; falha em typos/nomes compostos (ex: "onion rings" corrigido recentemente); sem fuzzy matching.
- **Escalabilidade**: In-memory carrinhos perdem estado em restart; DB SQLite não escala para multi-servidor.
- **UI/UX no Painel**: JS inline em HTML (dificulta manutenção); agregação perde índices reais para multi-itens idênticos; sem feedback loading/erro.
- **Gatilhos**: Matching pode ter falsos positivos (ex: palavras comuns); normalização recente ajuda, mas precisa testes.
- **Erros Comuns**: "ID não encontrado" em mapas desatualizados (corrigidos); dependência de Chrome para PDF/impressão.
- **Testes/Segurança**: Zero testes unitários; sem validação de input admin (ex: SQL injection em DB); exposição socket sem auth.

## 8. Sugestões de Melhorias
- **Parsing/UI**: Fuzzy search (ex: Levenshtein) para itens; extrair JS para arquivos separados; adicionar toast/notificações no painel.
- **Escalabilidade**: Migrar carrinhos para Redis; adicionar queue para mensagens (BullMQ).
- **Testes**: Jest para unit tests em parsers/mapa; Cypress para E2E no painel.
- **Segurança**: JWT para socket; sanitizar inputs DB.
- **Features**: Analytics (vendas por item); integração PagSeguro para PIX; app mobile admin.
- **Refatoração**: Centralizar normalização (função shared); usar TypeScript para types em mapas/carrinhos.
- **Próximos Passos**: Implementar testes básicos; seguir `PLAN_PEDIDOS_UPGRADE.md` para painel.

*Análise gerada em 06/09/2025. Baseada em inspeção estática e logs recentes. Para análise dinâmica, rode testes ou profiling.*
