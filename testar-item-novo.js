const cardapioService = require('./src/services/cardapioService');
const analisePalavras = require('./src/core/analisePalavras');
const carrinhoService = require('./src/services/carrinhoService');

async function testarItemNovo() {
  console.log('=== TESTE: ITEM NOVO NO CARDÁPIO ===');
  
  try {
    // 1. Inicializar serviços
    await cardapioService.init();
    
    // 2. Adicionar um item de teste
    console.log('\n1. Adicionando item de teste...');
    const novoItem = {
      nome: 'X-Fish Especial',
      descricao: 'Hambúrguer de peixe com molho especial',
      preco: 28.00,
      tipo: 'Lanche'
    };
    
    const novoId = cardapioService.addItem(novoItem);
    console.log(`✅ Item adicionado com ID: ${novoId}`);
    
    // 3. Adicionar mapeamentos
    console.log('\n2. Adicionando mapeamentos...');
    const gatilhos = ['xfish', 'x fish', 'x-fish', 'fish', 'peixe'];
    
    for (const gatilho of gatilhos) {
      cardapioService.addMapping(gatilho, novoId);
      console.log(`✅ Mapeamento: '${gatilho}' -> ID ${novoId}`);
    }
    
    // 4. Verificar se o item foi salvo
    console.log('\n3. Verificando item no cardápio...');
    const items = cardapioService.getItems();
    const itemEncontrado = items.find(item => item.id === novoId);
    
    if (itemEncontrado) {
      console.log(`✅ Item encontrado: ID ${itemEncontrado.id} - ${itemEncontrado.nome} - R$ ${itemEncontrado.preco} (${itemEncontrado.tipo})`);
    } else {
      console.log('❌ Item não encontrado no cardápio');
      return;
    }
    
    // 5. Verificar mapeamentos
    console.log('\n4. Verificando mapeamentos...');
    const mappings = cardapioService.getMappings();
    
    for (const gatilho of gatilhos) {
      const idMapeado = mappings[gatilho];
      if (idMapeado === novoId) {
        console.log(`✅ Mapeamento OK: '${gatilho}' -> ID ${idMapeado}`);
      } else {
        console.log(`❌ Mapeamento ERRO: '${gatilho}' -> ID ${idMapeado} (esperado: ${novoId})`);
      }
    }
    
    // 6. Testar reconhecimento via getItemIdByName
    console.log('\n5. Testando reconhecimento via getItemIdByName...');
    
    for (const gatilho of gatilhos) {
      const idReconhecido = await analisePalavras.getItemIdByName(gatilho);
      if (idReconhecido === novoId) {
        console.log(`✅ Reconhecimento OK: '${gatilho}' -> ID ${idReconhecido}`);
      } else {
        console.log(`❌ Reconhecimento ERRO: '${gatilho}' -> ID ${idReconhecido} (esperado: ${novoId})`);
      }
    }
    
    // 7. Simular pedido via WhatsApp
    console.log('\n6. Simulando pedido via WhatsApp...');
    
    const clienteId = '554191798537';
    carrinhoService.initCarrinho(clienteId);
    const carrinhoAtual = carrinhoService.getCarrinho(clienteId);
    
    // Mock do objeto msg
    const mockMsg = {
      from: `${clienteId}@c.us`,
      body: 'xfish',
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
    
    console.log('Estado inicial do carrinho:', carrinhoAtual.estado);
    console.log('Itens no carrinho:', carrinhoAtual.carrinho.length);
    
    // Processar mensagem 'xfish'
    const palavras = analisePalavras.separarMensagem('xfish');
    console.log('Palavras separadas:', palavras);
    
    const resultado = await analisePalavras.analisarPalavras(
      palavras, 
      carrinhoAtual, 
      mockMsg, 
      clienteId, 
      mockClient, 
      mockMessageMedia
    );
    
    console.log('\n7. Resultado do processamento:');
    console.log('Ações retornadas:', resultado);
    console.log('Estado do carrinho:', carrinhoAtual.estado);
    console.log('Itens no carrinho:', carrinhoAtual.carrinho.length);
    
    if (carrinhoAtual.carrinho.length > 0) {
      console.log('\nItens adicionados ao carrinho:');
      carrinhoAtual.carrinho.forEach((item, index) => {
        console.log(`  ${index + 1}. ID ${item.id}: ${item.nome} - R$ ${item.preco.toFixed(2)} (${item.tipo})`);
      });
    } else {
      console.log('\n❌ Nenhum item foi adicionado ao carrinho!');
    }
    
    // 8. Limpar teste (remover item)
    console.log('\n8. Limpando teste...');
    
    // Remover mapeamentos
    for (const gatilho of gatilhos) {
      cardapioService.removeMapping(gatilho);
    }
    
    // Remover item
    cardapioService.removeItem(novoId);
    console.log(`✅ Item ID ${novoId} removido do cardápio`);
    
    console.log('\n=== TESTE CONCLUÍDO ===');
    
  } catch (error) {
    console.error('Erro no teste:', error);
  }
}

testarItemNovo();