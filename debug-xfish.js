const analisePalavras = require('./src/core/analisePalavras');
const carrinhoService = require('./src/services/carrinhoService');
const cardapioService = require('./src/services/cardapioService');

async function debugXfish() {
  console.log('=== DEBUG: XFISH ===');
  
  try {
    // Inicializar serviços
    await cardapioService.init();
    
    // Simular cliente
    const clienteId = '554191798537';
    
    // Inicializar carrinho
    carrinhoService.initCarrinho(clienteId);
    const carrinhoAtual = carrinhoService.getCarrinho(clienteId);
    
    console.log('\n1. Estado inicial do carrinho:');
    console.log('Estado:', carrinhoAtual.estado);
    console.log('Itens no carrinho:', carrinhoAtual.carrinho.length);
    
    // Simular mensagem 'xfish'
    const mensagem = 'xfish';
    console.log(`\n2. Processando mensagem: "${mensagem}"`);
    
    // Separar mensagem em palavras (como faz o bot)
    const palavras = analisePalavras.separarMensagem(mensagem);
    console.log('Palavras separadas:', palavras);
    
    // Verificar mapeamentos
    const mappings = cardapioService.getMappings();
    console.log('\n3. Verificando mapeamentos:');
    console.log('xfish ->', mappings['xfish']);
    console.log('x fish ->', mappings['x fish']);
    console.log('fish ->', mappings['fish']);
    
    // Mock do objeto msg
    const mockMsg = {
      from: `${clienteId}@c.us`,
      body: mensagem,
      reply: (text) => console.log('BOT RESPOSTA:', text)
    };
    
    // Mock do client
    const mockClient = {
      sendMessage: (to, media, options) => {
        console.log('BOT ENVIANDO:', options ? options.caption || 'Mídia' : 'Mídia');
      }
    };
    
    // Mock do MessageMedia
    const mockMessageMedia = {
      fromFilePath: (path) => ({ path })
    };
    
    console.log('\n4. Executando analisarPalavras...');
    
    // Executar análise de palavras
    const resultado = await analisePalavras.analisarPalavras(
      palavras, 
      carrinhoAtual, 
      mockMsg, 
      clienteId, 
      mockClient, 
      mockMessageMedia
    );
    
    console.log('\n5. Resultado após analisarPalavras:');
    console.log('Ações retornadas:', resultado);
    console.log('Estado do carrinho:', carrinhoAtual.estado);
    console.log('Itens no carrinho:', carrinhoAtual.carrinho.length);
    
    if (carrinhoAtual.carrinho.length > 0) {
      console.log('\n6. Itens adicionados ao carrinho:');
      carrinhoAtual.carrinho.forEach((item, index) => {
        console.log(`  ${index + 1}. ID ${item.id}: ${item.nome} - R$ ${item.preco.toFixed(2)} (${item.tipo})`);
      });
    } else {
      console.log('\n6. Nenhum item foi adicionado ao carrinho.');
    }
    
    // Testar getItemIdByName
    console.log('\n7. Testando getItemIdByName:');
    const itemId1 = await analisePalavras.getItemIdByName('xfish');
    const itemId2 = await analisePalavras.getItemIdByName('fish');
    console.log('getItemIdByName("xfish") ->', itemId1);
    console.log('getItemIdByName("fish") ->', itemId2);
    
    console.log('\n=== FIM DEBUG ===');
    
  } catch (error) {
    console.error('Erro no debug:', error);
  }
}

debugXfish();