const analisePalavras = require('./src/core/analisePalavras');
const carrinhoService = require('./src/services/carrinhoService');
const cardapioService = require('./src/services/cardapioService');

async function debugCocaLata() {
  console.log('=== DEBUG: COCA LATA ===');
  
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
    
    // Simular mensagem 'coca lata'
    const mensagem = 'coca lata';
    console.log(`\n2. Processando mensagem: "${mensagem}"`);
    
    // Separar mensagem em palavras (como faz o bot)
    const palavras = analisePalavras.separarMensagem(mensagem);
    console.log('Palavras separadas:', palavras);
    
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
    
    console.log('\n3. Executando analisarPalavras...');
    
    // Executar análise de palavras (primeira etapa do bot)
    const acoes = await analisePalavras.analisarPalavras(palavras, carrinhoAtual, mockMsg, clienteId, mockClient, mockMessageMedia);
    
    console.log('\n4. Resultado após analisarPalavras:');
    console.log('Ações retornadas:', acoes);
    console.log('Estado do carrinho:', carrinhoAtual.estado);
    console.log('Itens no carrinho:', carrinhoAtual.carrinho.length);
    
    if (carrinhoAtual.carrinho.length > 0) {
      console.log('\n5. Itens adicionados ao carrinho:');
      carrinhoAtual.carrinho.forEach((item, index) => {
        console.log(`  ${index + 1}. ID ${item.id}: ${item.nome} - R$ ${item.preco.toFixed(2)} (${item.tipo})`);
      });
    }
    
    // Verificar mapeamentos específicos
    console.log('\n6. Verificando mapeamentos:');
    const mappings = cardapioService.getMappings();
    
    console.log('coca lata ->', mappings['coca lata'] || 'NÃO ENCONTRADO');
    console.log('coca ->', mappings['coca'] || 'NÃO ENCONTRADO');
    console.log('lata ->', mappings['lata'] || 'NÃO ENCONTRADO');
    
    // Testar getItemIdByName
    console.log('\n7. Testando getItemIdByName:');
    const itemId1 = await analisePalavras.getItemIdByName('coca lata');
    const itemId2 = await analisePalavras.getItemIdByName('coca');
    const itemId3 = await analisePalavras.getItemIdByName('lata');
    
    console.log('getItemIdByName("coca lata") ->', itemId1);
    console.log('getItemIdByName("coca") ->', itemId2);
    console.log('getItemIdByName("lata") ->', itemId3);
    
    // Verificar se os IDs correspondem aos itens corretos
    const items = cardapioService.getItems();
    if (itemId1) {
      const item = items.find(i => i.id === itemId1);
      console.log(`ID ${itemId1} corresponde a:`, item ? `${item.nome} - R$ ${item.preco} (${item.tipo})` : 'ITEM NÃO ENCONTRADO');
    }
    
    console.log('\n=== FIM DEBUG ===');
    
  } catch (error) {
    console.error('Erro no debug:', error);
  }
}

debugCocaLata();