# Análise Resumida do Sistema Brutus Burger Bot

## Visão Geral
O sistema é um bot para WhatsApp integrado a um painel administrativo web, projetado para gerenciar pedidos em um restaurante de hambúrgueres (Brutus Burger). Utiliza Node.js com whatsapp-web.js para interação via WhatsApp, Socket.IO para real-time no painel admin, e SQLite para persistência de dados de clientes e carrinhos. O foco é em automação de pedidos, análise de mensagens do cliente, e gerenciamento administrativo em tempo real.

- **Linguagem/Tech Stack Principal**: Node.js, Express, Socket.IO, whatsapp-web.js (Puppeteer), SQL.js (SQLite in-memory).
- **Estrutura do Workspace**: 
  - `bot.js`: Entrada principal, inicializa WhatsApp client, socket handlers, e fluxos de análise.
  - `src/core/`: Lógica de parsing de mensagens (`analisePalavras.js`, `analisePorStatus.js`), fluxos de menu (`menuGlobal.js`, etc.).
  - `src/services/`: Serviços para carrinho (`carrinhoService.js`) e clientes (`clienteService.js`).
  - `src/utils/`: Mapas de itens (`mapaLanches.js`, `mapaBebidas.js`), cardápio (`cardapio.js`), mensagens.
  - `public/`: Painel admin (`pedidos.html`, `admin.html`) para visualização de pedidos e ações.
- **Banco de Dados**: SQLite em `~/AppData/ROBO-BOT/clientes.db`, com tabelas para clientes (nome, endereço, histórico, total_gasto) e gatilhos personalizados.
- **Portas/Endpoints**: Dashboard em `localhost:3001/pedidos` (Socket.IO para updates em tempo real).

## Funcionalidades Principais
### 1. **Interação via WhatsApp (Bot para Clientes)**
   - **Análise de Mensagens**: 
     - `analisePalavras.js`: Parse de input do cliente para itens (lanches, bebidas, adicionais) usando mapas (`mapaLanches`, `mapaBebidas`) e regex para preparos (ex: "sem bacon").
     - `analisePorStatus.js`: Roteia mensagens baseado no estado do carrinho (`menuInicial`, `menuEndereço`, etc.).
     - Suporte a quantidades ("2 coca lata"), preparos ("dallas sem cebola"), e comandos ("cardápio", "pix").
   - **Fluxo de Pedido**:
     - Inicial: Saudação personalizada (primeira mensagem do dia, usa `obterInformacoesCliente` para nome).
     - Adição de Itens: Processa lanches/bebidas, agrega no carrinho (`adicionarItemAoCarrinho`), mostra resumo (`carrinhoView`).
     - Endereço: Reutiliza endereço salvo (`buscarEnderecoCliente`), valida e limpa inválidos; calcula entrega (`valorEntrega`).
     - Finalização: Valida dados obrigatórios (nome, endereço, ponto da carne), calcula total, envia confirmação.
     - Persistência: Salva histórico e gasto total em DB; emite eventos para painel.
   - **Gatilhos Personalizados**: Armazenados em `gatilhos.json` ou DB; ativam respostas automáticas (ex: "qual x da questao" → mostrar cardápio). Matching melhorado com normalização (lowercase, strip pontuação).
   - **Tratamento de Erros**: Logs detalhados, cooldowns para envios repetidos (ex: cardápio).

### 2. **Painel Administrativo (`public/pedidos.html`)**
   - **Visualização em Tempo Real**: Cards com carrinhos (agregados por item, total calculado localmente), histórico de mensagens.
   - **Ações Admin**:
     - Adicionar/Remover/Atualizar Quantidade: Emite `admin:addItem`, `admin:removeItem`, `admin:updateQuantity`; backend responde com `admin:ack`.
     - Enviar Mensagem: `admin:sendMessage` via WhatsApp client.
     - Finalizar: `admin:finalizarCarrinho` simula input 'finalizar' no fluxo do cliente.
     - Reset/Limpar: `admin:reset` limpa carrinho e volta a `menuInicial`.
     - Modal de Conversa: Histórico, input para envio, carrinho agregado com botões +/−, ações rápidas.
   - **Atualizações**: Socket `carrinho:update` re-renderiza cards/modal; cálculo local de total evita desatualizações.
   - **UI/UX**: Estilo dark, ícones, agregação de itens duplicados, feedback via ack (toasts opcionais).

### 3. **Persistência e Serviços**
   - **ClienteService**: Gerencia DB de clientes (nome, endereço com lat/lng, histórico mensagens, total_gasto); funções como `adicionarHistorico`, `adicionarGasto`.
   - **CarrinhoService**: In-memory carrinhos com eventos (`events.emit('update')`); funções para add/remove/update, `valorTotal` (inclui entrega), `resetCarrinho`.
   - **Geração de Pedidos**: `salvarPedido` gera PDF/HTML para impressão (usa Puppeteer); `carrinhoAdm` para resumo textual.
   - **Migrações**: Auto-criação de tabelas; limpeza de endereços inválidos no finalização.

### 4. **Integrações e Recursos Avançados**
   - **Imagens de Cardápio**: Envia `cardapio.jpg`/`cardapio2.jpg` via `MessageMedia`.
   - **Geolocalização**: Suporte a localização (`analisarLocalizacao` em `menuEndereço.js`); integra com Google Maps.
   - **Pagamentos**: Chave PIX via `getPix`; suporte a troco (`menuTroco`).
   - **Suporte**: Fluxo `menuSuporte` para observações.
   - **Admin Avançado**: `public/admin.html` para gerenciar gatilhos (criar/editar/ativar).

## Pontos Fortes
- **Real-Time**: Socket.IO garante sincronia entre bot e painel.
- **Modular**: Separação clara (core, services, utils); fácil extensão de mapas de itens.
- **Persistência Robusta**: DB para clientes/histórico; validação de endereços.
- **UX Cliente**: Fluxo conversacional natural, reutilização de dados (endereço, nome).

## Limitações e Sugestões de Melhoria
- **Parsing de Mensagens**: Pode falhar em frases complexas (ex: typos em bebidas); sugerir ML ou fuzzy matching.
- **Escalabilidade**: In-memory carrinhos ok para low-volume; para high-traffic, migrar para Redis/PostgreSQL.
- **Segurança**: Exposição de socket sem auth; adicionar tokens ou IP whitelist.
- **Testes**: Ausência de unit tests; adicionar Jest para parsers e fluxos.
- **Mobile Admin**: Painel responsivo parcial; otimizar para telas pequenas.
- **Integrações**: Adicionar webhook para pagamentos (Pix via API) e notificações push para admins.

## Conclusão
O sistema é funcional e bem estruturado para um bot de pedidos, com ênfase em automação e gerenciamento admin. Upgrades priorizam robustez no parsing e UX no painel (ver `PLAN_PEDIDOS_UPGRADE.md`). Potencial para expansão (integração com delivery apps, analytics de vendas).

*Análise gerada em [data atual]. Para atualizações, rode análise manual ou adicione scripts de auto-geração.*
