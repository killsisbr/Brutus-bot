const { Client, LocalAuth, MessageMedia, LegacySessionAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const path = require('path');
const fs = require('fs');
const carrinhoService = require('./src/services/carrinhoService');
// Real-time dashboard server
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server);
const clientService = require('./src/services/clienteService');
const atualizarEstadoDoCarrinho = carrinhoService.atualizarEstadoDoCarrinho;
const mensagens = require('./src/utils/mensagens');
const core = require('./src/core/analisePalavras');
const carrinhoView = carrinhoService.carrinhoView;
const atualizarEnderecoCliente = carrinhoService.atualizarEnderecoCliente;
const atualizarNomeCliente = clientService.atualizarNomeCliente;
const printarClientes = clientService.printarClientes;
const obterInformacoesCliente = clientService.obterInformacoesCliente;
const analisarPalavras = core.analisarPalavras;
const separarMensagem = core.separarMensagem;
const resp = mensagens.mensagem;
const carrinhos = carrinhoService.carrinhos;
const events = carrinhoService.events; // EventEmitter para atualizações
const analisePorStatus = require('./src/core/analisePorStatus');
const { error } = require('console');
const resetCarrinho = carrinhoService.resetCarrinho;
let obterUnidade = require('./src/utils/obterUnidade').obterUnidade;

// Estados
const stats = {
  menuInicial: 'menu_inicial',
  menuFinalizado: 'menu_finalizado',
  menuAdicionais: 'menu_adicionais',
  menuNome: 'menu_nome',
  menuObservacao: 'menu_observacao',
  menuPagamento: 'menu_pagamento',
  menuTroco: 'menu_troco',
  menuEndereco: 'menu_endereco',
  menuSuporte: 'menu_suporte'
};

// Estado do cliente WhatsApp
let isReady = false;

// Funções auxiliares para persistência
function salvarMensagens() {
  try {
    const mensagensPath = path.join(__dirname, 'src', 'utils', 'mensagens.js');
    const conteudo = `// Arquivo gerado automaticamente pelo painel de mensagens
const mensagem = ${JSON.stringify(mensagens.mensagem, null, 2)};

module.exports = { mensagem };`;
    
    fs.writeFileSync(mensagensPath, conteudo, 'utf8');
    console.log('✅ Mensagens salvas com sucesso');
  } catch (error) {
    console.error('❌ Erro ao salvar mensagens:', error);
  }
}

function salvarGatilhos() {
  try {
    const gatilhosPath = path.join(__dirname, 'data', 'gatilhos.json');
    
    // Criar diretório data se não existir
    const dataDir = path.dirname(gatilhosPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    fs.writeFileSync(gatilhosPath, JSON.stringify(gatilhosPersonalizados, null, 2), 'utf8');
    console.log('✅ Gatilhos salvos com sucesso');
  } catch (error) {
    console.error('❌ Erro ao salvar gatilhos:', error);
  }
}

function carregarGatilhos() {
  try {
    const gatilhosPath = path.join(__dirname, 'data', 'gatilhos.json');
    if (fs.existsSync(gatilhosPath)) {
      const dados = fs.readFileSync(gatilhosPath, 'utf8');
      gatilhosPersonalizados = JSON.parse(dados);
      console.log('✅ Gatilhos carregados com sucesso');
    }
  } catch (error) {
    console.error('❌ Erro ao carregar gatilhos:', error);
    gatilhosPersonalizados = {};
  }
}

// Função para verificar gatilhos personalizados
function verificarGatilhosPersonalizados(mensagem, msg, idAtual) {
  const palavrasMensagem = mensagem.toLowerCase().split(' ');
  
  for (const [id, gatilho] of Object.entries(gatilhosPersonalizados)) {
    const encontrou = gatilho.palavras.some(palavra => 
      palavrasMensagem.some(palavraMensagem => 
        palavraMensagem.includes(palavra) || palavra.includes(palavraMensagem)
      )
    );
    
    if (encontrou) {
      // Incrementar contador de usos
      gatilho.usos = (gatilho.usos || 0) + 1;
      salvarGatilhos();
      
      // Enviar resposta
      if (mensagens.mensagem && mensagens.mensagem[gatilho.mensagem]) {
        msg.reply(mensagens.mensagem[gatilho.mensagem].conteudo);
      } else {
        msg.reply(gatilho.mensagem);
      }
      
      // Executar ação adicional se houver
      if (gatilho.acao) {
        executarAcaoGatilho(gatilho.acao, msg, idAtual);
      }
      
      return true;
    }
  }
  
  return false;
}

// Função para executar ações dos gatilhos
function executarAcaoGatilho(acao, msg, idAtual) {
  switch (acao) {
    case 'mostrar_cardapio':
      // Enviar imagens do cardápio
      if (fs.existsSync('./cardapio.jpg')) {
        const media = MessageMedia.fromFilePath('./cardapio.jpg');
        msg.reply(media);
      }
      break;
      
    case 'iniciar_pedido':
      // Resetar carrinho e iniciar novo pedido
      if (carrinhos[idAtual]) {
        resetCarrinho(idAtual, carrinhos[idAtual]);
        atualizarEstadoDoCarrinho(idAtual, carrinhoService.stats.menuInicial);
      }
      break;
      
    case 'transferir_humano':
      msg.reply('🙋‍♂️ Transferindo você para um atendente humano. Aguarde um momento...');
      // Implementar lógica de transferência
      break;
      
    case 'resetar_conversa':
      if (carrinhos[idAtual]) {
        resetCarrinho(idAtual, carrinhos[idAtual]);
        msg.reply('🔄 Conversa reiniciada. Como posso ajudá-lo?');
      }
      break;
  }
}

clientService.createBanco();

// Carregar gatilhos personalizados
carregarGatilhos();

// --- Configura servidor de dashboard (admin) ---
const publicDir = path.join(process.cwd(), 'public');
app.use(express.static(publicDir));

// API simples para recuperar o estado atual dos carrinhos (útil para o dashboard)
app.get('/api/carrinhos', (req, res) => {
  try {
    res.json({ carrinhos });
  } catch (err) {
    res.status(500).json({ error: 'failed to read carrinhos' });
  }
});

// APIs para gerenciar mensagens
app.get('/api/mensagens', (req, res) => {
  try {
    res.json(mensagens.mensagem || {});
  } catch (err) {
    res.status(500).json({ error: 'failed to read mensagens' });
  }
});

app.post('/api/mensagens', (req, res) => {
  try {
    const { chave, conteudo, categoria } = req.body;
    if (!chave || !conteudo) {
      return res.status(400).json({ error: 'Chave e conteúdo são obrigatórios' });
    }
    
    if (!mensagens.mensagem) {
      mensagens.mensagem = {};
    }
    
    mensagens.mensagem[chave] = {
      conteudo,
      categoria: categoria || 'geral',
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString()
    };
    
    // Salvar no arquivo
    salvarMensagens();
    
    // Notificar via socket
    io.emit('mensagem-atualizada', { chave, acao: 'criada' });
    
    res.json({ success: true, chave });
  } catch (err) {
    console.error('Erro ao salvar mensagem:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.delete('/api/mensagens/:chave', (req, res) => {
  try {
    const { chave } = req.params;
    
    if (mensagens.mensagem && mensagens.mensagem[chave]) {
      delete mensagens.mensagem[chave];
      salvarMensagens();
      
      io.emit('mensagem-atualizada', { chave, acao: 'excluida' });
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Mensagem não encontrada' });
    }
  } catch (err) {
    console.error('Erro ao excluir mensagem:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// APIs para gerenciar gatilhos
let gatilhosPersonalizados = {};

app.get('/api/gatilhos', (req, res) => {
  try {
    res.json(gatilhosPersonalizados);
  } catch (err) {
    res.status(500).json({ error: 'failed to read gatilhos' });
  }
});

app.post('/api/gatilhos', (req, res) => {
  try {
    const { palavras, mensagem, acao } = req.body;
    if (!palavras || palavras.length === 0 || !mensagem) {
      return res.status(400).json({ error: 'Palavras e mensagem são obrigatórios' });
    }
    
    const id = Date.now().toString();
    gatilhosPersonalizados[id] = {
      palavras: palavras.map(p => p.toLowerCase()),
      mensagem,
      acao: acao || null,
      criadoEm: new Date().toISOString(),
      usos: 0
    };
    
    salvarGatilhos();
    io.emit('gatilho-atualizado', { id, acao: 'criado' });
    
    res.json({ success: true, id });
  } catch (err) {
    console.error('Erro ao salvar gatilho:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

app.delete('/api/gatilhos/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    if (gatilhosPersonalizados[id]) {
      delete gatilhosPersonalizados[id];
      salvarGatilhos();
      
      io.emit('gatilho-atualizado', { id, acao: 'excluido' });
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Gatilho não encontrado' });
    }
  } catch (err) {
    console.error('Erro ao excluir gatilho:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// API para estatísticas
app.get('/api/estatisticas', (req, res) => {
  try {
    const hoje = new Date().toDateString();
    const totalCarrinhos = Object.keys(carrinhos).length;
    
    res.json({
      totalMensagens: Object.keys(mensagens.mensagem || {}).length,
      totalGatilhos: Object.keys(gatilhosPersonalizados).length,
      mensagensHoje: 0, // Implementar contador de mensagens por dia
      usuariosAtivos: totalCarrinhos
    });
  } catch (err) {
    res.status(500).json({ error: 'failed to read estatisticas' });
  }
});

// Rota para servir o PDF/HTML do pedido gerado (visualizar/baixar)
app.get('/pedidos/:id', (req, res) => {
  try {
    const id = req.params.id;
    // Segurança: não permita caminhos com ../
    if (id.includes('..') || id.includes('/')) return res.status(400).send('invalid id');
    const ordersDir = path.join(process.cwd(), 'Pedidos');
    const pdfPath = path.join(ordersDir, `${id}.pdf`);
    const htmlPath = path.join(ordersDir, `${id}.html`);
    if (fs.existsSync(pdfPath)) return res.sendFile(pdfPath);
    if (fs.existsSync(htmlPath)) return res.sendFile(htmlPath);
    return res.status(404).send('Pedido não encontrado');
  } catch (err) {
    console.error('Erro ao servir pedido:', err);
    return res.status(500).send('erro interno');
  }
});

// Rota para o painel de mensagens
app.get('/painel-mensagens', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'painel-mensagens.html'));
});

io.on('connection', (socket) => {
  console.log('[dashboard] cliente conectado', socket.id);
  // Envia estado atual dos carrinhos ao conectar
  socket.emit('initial', { carrinhos });

  // Comandos do dashboard: alterar estado de um carrinho
  socket.on('admin:setState', (data) => {
    try {
      const { id, state } = data || {};
      if (id && state && carrinhoService && typeof carrinhoService.atualizarEstadoDoCarrinho === 'function') {
        carrinhoService.atualizarEstadoDoCarrinho(id, state);
        socket.emit('admin:ack', { ok: true, id, state });
      } else {
        socket.emit('admin:ack', { ok: false, error: 'invalid_payload' });
      }
    } catch (err) {
      socket.emit('admin:ack', { ok: false, error: String(err) });
    }
  });

  // Comando do dashboard: resetar carrinho
  socket.on('admin:reset', (data) => {
    try {
      const { id } = data || {};
      if (id && carrinhoService && typeof carrinhoService.resetCarrinho === 'function') {
        carrinhoService.resetCarrinho(id, carrinhos[id]);
        socket.emit('admin:ack', { ok: true, id });
      } else {
        socket.emit('admin:ack', { ok: false, error: 'invalid_payload' });
      }
    } catch (err) {
      socket.emit('admin:ack', { ok: false, error: String(err) });
    }
  });
});

// Escuta eventos do carrinhoService e retransmite por socket.io
if (events && typeof events.on === 'function') {
  events.on('update', (payload) => {
    try { io.emit('carrinho:update', payload); } catch (e) { }
  });
}

// Inicia o servidor em porta 3001 se não houver variáveis de ambiente
const DASHBOARD_PORT = process.env.DASHBOARD_PORT || 3001;
server.listen(DASHBOARD_PORT, () => console.log(`[dashboard] servindo ${publicDir} em http://localhost:${DASHBOARD_PORT}`));


// Função para checar se Chrome está instalado no caminho padrão do Windows
function getChromePath() {
  const chromePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
  if (fs.existsSync(chromePath)) {
    console.log('✅ Chrome encontrado no caminho padrão.');
    return chromePath;
  } else {
    console.warn('⚠️ Chrome não encontrado no caminho padrão.');
    return null;
  }
}

const chromeExecutablePath = getChromePath();
const client = new Client({
  puppeteer: {
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding'
    ],
    headless: true,
    executablePath: chromeExecutablePath || undefined,
    timeout: 90000,
    defaultViewport: null
  },
  webVersionCache: {
    type: 'remote',
    remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
  },
  authStrategy: new LocalAuth({
    clientId: 'bot-assist',
    dataPath: path.dirname(clientService.caminhoBanco)
  }),
  takeoverOnConflict: true,
  takeoverTimeoutMs: 15000,
  qrMaxRetries: 5
});

client.initialize();

// Eventos com melhor debugging
client.on('qr', (qr) => {
  console.log('📱 QR Code recebido! Escaneie com WhatsApp...');
  qrcode.toString(qr, { type: 'terminal', small: true }, (err, url) => {
    if (err) {
      console.error('❌ Erro ao gerar QR code:', err);
    } else {
      console.log(url);
      console.log('⏰ QR Code exibido. Aguardando escaneamento...');
    }
  });
});

client.on('ready', () => {
  console.log('🎉 Cliente WhatsApp está pronto e conectado!');
  isReady = true;
});

client.on('authenticated', () => {
  console.log('🔐 Autenticação WhatsApp realizada com sucesso!');
});

client.on('loading_screen', (percent, message) => {
  console.log(`📊 Carregando WhatsApp Web: ${percent}% - ${message}`);
});

client.on('change_state', (state) => {
  console.log('🔄 Estado do cliente mudou para:', state);
});

client.on('auth_failure', msg => {
  console.error('❌ Falha na autenticação WhatsApp:', msg);
  process.exit(1);
});

client.on('disconnected', (reason) => {
  console.log('⚠️ Cliente WhatsApp desconectado:', reason);
  isReady = false;
});

// Adicionar tratamento global de erros
process.on('unhandledRejection', (reason, promise) => {
  console.log('❌ Rejeição não tratada em:', promise, 'motivo:', reason);
});

process.on('uncaughtException', (error) => {
  console.log('❌ Exceção não capturada:', error);
});


client.on('message_create', async (msg) => {
  // Verifica se a mensagem foi enviada por você
  if (msg.fromMe) {
    try {


      //console.log('Mensagem enviada por você:', msg.body);
      let idAtual = msg.to.replace('@c.us', ''); // Obtém o destinatário da mensagem

      // Exemplo: Verifica se a mensagem enviada começa com "Endereço"
      if (msg.body.startsWith('Endereço ')) {
        let endereco = msg.body.replace('Endereço ', '').trim(); // Extrai o endereço

        // Atualiza o endereço no carrinho do cliente
        atualizarEnderecoCliente(idAtual, endereco); // Atualiza no banco de dados, se necessário
        console.log(`Endereço atualizado para o cliente ${idAtual}: ${endereco}`);
        if (carrinhos[idAtual]) {
          carrinhos[idAtual].endereco = endereco;
        }
      }
      if (msg.body.toLowerCase() === 'c') {
        if (carrinhos[idAtual].carrinho.length > 0) {
          carrinhos[idAtual].carrinho.pop();
          if (carrinhos[idAtual].carrinho.length === 0) {
            msg.reply('Seu carrinho está vazio. \n' + resp.msgmenuInicialSub);
          } else {
            msg.reply(`${carrinhoView(idAtual)}\n${resp.msgmenuInicialSub}`);
          }
        } else {
          msg.reply('Seu carrinho está vazio. \n' + resp.msgmenuInicialSub);
        }
      }
      if (msg.body === '...') {
        msg.reply(`${carrinhoView(idAtual)}\n${resp.msgmenuInicialSub}`);
      }

      if (msg.body.toLowerCase() === 'b') {
        msg.reply(`${mensagens.mensagem.msgMenuBebidas}`);
      }

      if (msg.body.startsWith('. ')) {
        let pedido = msg.body.replace('. ', '').trim();
        let palavras = separarMensagem(pedido);
        analisarPalavras(palavras, carrinhos[idAtual], msg, idAtual);
      }
      if (msg.body.startsWith('Nome ')) {
        let novoNome = msg.body.replace('Nome ', '').trim(); // Extrai o nome
        // Atualiza o nome do cliente no banco de dados
        if (novoNome) {
          atualizarNomeCliente(idAtual, novoNome); // Atualiza no banco de dados
          console.log(`Nome atualizado para o cliente ${idAtual}: ${novoNome}`);
        } else {
          console.log('Nome inválido fornecido.');
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
});


client.on('message', async msg => {
  try {
    const stats = carrinhoService.stats;



    // ---------------- PRIVADO - Atendimento do cliente ----------------
    if (msg.from.includes('@g.us')) return; // agora sim, ignora o grupo

    if (!msg.body || typeof msg.body !== 'string') return;
    const idAtual = msg.from.replace('@c.us', '');
    let carrinhoAtual = carrinhoService.carrinhos[idAtual];

    if (msg.body == ".ver") {
      printarClientes();
      return;
    }

    if (msg.body.toLowerCase() === 'reiniciar' || msg.body.toLowerCase() === 'cancelar') {
      resetCarrinho(idAtual, carrinhoAtual);
      msg.reply('Seu carrinho foi reiniciado. \n' + resp.msgmenuInicialSub);
      atualizarEstadoDoCarrinho(idAtual, stats.menuInicial);
      return;
    }

    if (msg.body.startsWith('Nome ')) {
      const novoNome = msg.body.replace('Nome ', '').trim();
      if (novoNome) {
        atualizarNomeCliente(idAtual, novoNome);
        msg.reply(`Seu nome foi atualizado para: *${novoNome}*`);
      } else {
        msg.reply('Por favor, forneça um nome válido após o comando `Nome `.');
      }
      return;
    }

    // Cria carrinho se não existir
    if (!carrinhoAtual) {
      carrinhoAtual = {
        carrinho: [],
        estado: stats.menuInicial,
        valor: 0,
        aprt: false,
        alertAdicionado: false,
        idSelect: 0,
        lastMsg: '',
        quantidade: 0,
      };
      carrinhoService.carrinhos[idAtual] = carrinhoAtual;
      obterInformacoesCliente(idAtual, (err, dados) => {
        if (err) {

        }
        else if (dados) {
          carrinhoAtual.nome = dados.nome;
          if (dados.endereco === "LOCALIZAÇÃO") {
            carrinhoAtual.endereco = dados.endereco;
            carrinhoAtual.lat = dados.lat;
            carrinhoAtual.lng = dados.lng;
            console.log(`Localização do cliente: ${carrinhoAtual.lat}, ${carrinhoAtual.lng}`);
          }
          else {
            carrinhoAtual.endereco = dados.endereco;
            console.log(`Endereço do cliente: ${dados.endereco}`);
          }
        }
      });
    }

    carrinhoAtual.lastMsg = msg.body.toLowerCase().replace('brutos ', 'brutus ');
    carrinhoAtual.respUser = msg.body;

    if (msg.body.toLowerCase() === 'c') {
      if (carrinhoAtual.carrinho.length > 0) {
        carrinhoAtual.carrinho.pop();
        const msgFinal = carrinhoAtual.carrinho.length === 0
          ? 'Seu carrinho está vazio. \n' + resp.msgmenuInicialSub
          : `${carrinhoView(idAtual)}\n${resp.msgmenuInicialSub}`;
        msg.reply(msgFinal);
      } else {
        msg.reply('Seu carrinho está vazio. \n' + resp.msgmenuInicialSub);
      }
      return;
    }

    if (msg.body === '...') {
      msg.reply(`${carrinhoView(idAtual)}\n${resp.msgmenuInicialSub}`);
      return;
    }

    if (msg.body.toLowerCase() === 'b') {
      msg.reply(`${mensagens.mensagem.msgMenuBebidas}`);
      return;
    }

    if (msg.body.toLowerCase() === 'reiniciar') {
      msg.reply(`Seu carrinho foi reiniciado. \n` + resp.msgmenuInicialSub);
      resetCarrinho(idAtual, carrinhoAtual);
      atualizarEstadoDoCarrinho(idAtual, stats.menuInicial);
      return;
    }

    if (msg.body.startsWith('. ')) {
      const pedido = msg.body.replace('. ', '').trim();
      const palavras = separarMensagem(pedido);
      analisarPalavras(palavras, carrinhoAtual, msg, idAtual);
      return;
    }

    let palavras = separarMensagem(msg.body);
    palavras = palavras.filter(p => ![ 'cola', 'di', 'de'].includes(p.toLowerCase()));
    palavras = palavras.map(p => p.toLowerCase().replace('brutos', 'brutus'));

    let acoes;
    if (carrinhoAtual.estado === stats.menuInicial || carrinhoAtual.estado === undefined) {
      console.log('Analisando mensagem', palavras);
      acoes = analisarPalavras(palavras, carrinhoAtual, msg, idAtual, client, MessageMedia);
      console.log('Ações:', acoes);
    }

    // Garante que acoes é sempre um array para evitar erro de leitura de propriedade 'length'
    if (!Array.isArray(acoes)) {
      acoes = [];
    }

    if (!acoes || acoes.length === 0) {
      // Verificar gatilhos personalizados antes da análise por status
      const gatilhoEncontrado = verificarGatilhosPersonalizados(msg.body, msg, idAtual);
      
      if (!gatilhoEncontrado) {
        console.log('Analisando por status');
        analisePorStatus(carrinhoAtual, msg, idAtual, client, MessageMedia);
      }
    }

  } catch (error) {
    console.error('❌ Erro no client.on("message"):', error);
  }
});
