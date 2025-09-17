const { Client, LocalAuth } = require('whatsapp-web.js');
const path = require('path');

console.log('🔧 Testando conexão WhatsApp Web...');

const client = new Client({
  puppeteer: {
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu'
    ],
    headless: false, // Mostra o navegador para debug
    timeout: 60000
  },
  authStrategy: new LocalAuth({
    clientId: 'test-bot'
  }),
  takeoverOnConflict: true
});

client.on('qr', (qr) => {
  console.log('📱 QR Code gerado! Escaneie com seu WhatsApp');
});

client.on('ready', () => {
  console.log('✅ Cliente conectado com sucesso!');
});

client.on('auth_failure', msg => {
  console.error('❌ Falha na autenticação:', msg);
});

client.on('disconnected', (reason) => {
  console.log('🔌 Cliente desconectado:', reason);
});

client.on('message', async (msg) => {
  try {
    if (msg.body === 'teste') {
      await msg.reply('Bot funcionando! 🤖');
      console.log('✅ Mensagem de teste enviada com sucesso');
    }
  } catch (error) {
    console.error('❌ Erro ao processar mensagem:', error);
  }
});

// Tratamento global de erros
process.on('unhandledRejection', (reason, promise) => {
  console.log('⚠️ Rejeição não tratada:', reason);
});

process.on('uncaughtException', (error) => {
  console.log('⚠️ Exceção não capturada:', error);
});

console.log('🚀 Iniciando cliente...');
client.initialize();

// Timeout para encerrar teste
setTimeout(() => {
  console.log('⏰ Tempo limite atingido. Encerrando teste...');
  process.exit(0);
}, 120000); // 2 minutos
