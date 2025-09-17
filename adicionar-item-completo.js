const cardapioService = require('./src/services/cardapioService');
const analisePalavras = require('./src/core/analisePalavras');
const carrinhoService = require('./src/services/carrinhoService');

async function adicionarItemCompleto() {
  console.log('=== ADICIONAR ITEM COMPLETO AO CARDÁPIO ===');
  console.log('Este script adiciona um item e configura todos os mapeamentos necessários\n');
  
  try {
    // Inicializar serviços
    await cardapioService.init();
    
    // EXEMPLO: Adicionar X-Fish
    console.log('📝 EXEMPLO: Adicionando X-Fish ao cardápio\n');
    
    // 1. Definir o item
    const novoItem = {
      nome: 'X-Fish',
      descricao: 'Hambúrguer de peixe com alface, tomate e molho especial',
      preco: 25.00,
      tipo: 'Lanche'
    };
    
    console.log('1. Adicionando item ao cardápio...');
    console.log(`   Nome: ${novoItem.nome}`);
    console.log(`   Descrição: ${novoItem.descricao}`);
    console.log(`   Preço: R$ ${novoItem.preco.toFixed(2)}`);
    console.log(`   Tipo: ${novoItem.tipo}`);
    
    const novoId = cardapioService.addItem(novoItem);
    
    if (!novoId) {
      console.log('❌ Erro ao adicionar item ao cardápio');
      return;
    }
    
    console.log(`✅ Item adicionado com ID: ${novoId}\n`);
    
    // 2. Definir todos os mapeamentos possíveis
    console.log('2. Adicionando mapeamentos (palavras-chave)...');
    
    const mapeamentos = [
      // Variações do nome principal
      'x-fish',
      'xfish',
      'x fish',
      'fish',
      'peixe',
      
      // Variações com espaços e hífens
      'x-peixe',
      'xpeixe',
      'x peixe',
      
      // Variações comuns de digitação
      'xfih',
      'xfis',
      'fih',
      'fis',
      
      // Outras variações
      'hamburguer de peixe',
      'hambúrguer de peixe',
      'burger de peixe',
      'lanche de peixe'
    ];
    
    console.log(`   Adicionando ${mapeamentos.length} mapeamentos...`);
    
    for (const mapeamento of mapeamentos) {
      cardapioService.addMapping(mapeamento, novoId);
      console.log(`   ✅ '${mapeamento}' -> ID ${novoId}`);
    }
    
    console.log('\n3. Verificando se o item foi salvo corretamente...');
    
    // Verificar item
    const items = cardapioService.getItems();
    const itemEncontrado = items.find(item => item.id === novoId);
    
    if (itemEncontrado) {
      console.log(`✅ Item verificado: ID ${itemEncontrado.id} - ${itemEncontrado.nome} - R$ ${itemEncontrado.preco} (${itemEncontrado.tipo})`);
    } else {
      console.log('❌ Erro: Item não encontrado após adição');
      return;
    }
    
    // Verificar mapeamentos
    console.log('\n4. Verificando mapeamentos...');
    const mappings = cardapioService.getMappings();
    
    let mapeamentosOK = 0;
    let mapeamentosErro = 0;
    
    for (const mapeamento of mapeamentos) {
      const idMapeado = mappings[mapeamento];
      if (idMapeado === novoId) {
        mapeamentosOK++;
      } else {
        mapeamentosErro++;
        console.log(`❌ Erro no mapeamento: '${mapeamento}' -> ID ${idMapeado} (esperado: ${novoId})`);
      }
    }
    
    console.log(`✅ Mapeamentos OK: ${mapeamentosOK}/${mapeamentos.length}`);
    if (mapeamentosErro > 0) {
      console.log(`❌ Mapeamentos com erro: ${mapeamentosErro}`);
    }
    
    console.log('\n5. Testando reconhecimento...');
    
    // Aguardar um pouco para garantir que o cache seja atualizado
    console.log('   Aguardando atualização do cache...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const testesReconhecimento = ['xfish', 'x fish', 'fish', 'peixe', 'x-fish'];
    
    for (const teste of testesReconhecimento) {
      const idReconhecido = await analisePalavras.getItemIdByName(teste);
      if (idReconhecido === novoId) {
        console.log(`✅ Reconhecimento OK: '${teste}' -> ID ${idReconhecido}`);
      } else {
        console.log(`❌ Reconhecimento ERRO: '${teste}' -> ID ${idReconhecido} (esperado: ${novoId})`);
      }
    }
    
    console.log('\n6. Testando pedido simulado...');
    
    // Simular pedido
    const clienteId = '554191798537';
    carrinhoService.initCarrinho(clienteId);
    const carrinhoAtual = carrinhoService.getCarrinho(clienteId);
    
    // Mock básico
    const mockMsg = {
      from: `${clienteId}@c.us`,
      body: 'xfish',
      reply: (text) => console.log('   BOT RESPOSTA:', text.substring(0, 100) + '...')
    };
    
    const mockClient = { sendMessage: () => {} };
    const mockMessageMedia = { fromFilePath: () => ({}) };
    
    const palavras = analisePalavras.separarMensagem('xfish');
    const resultado = await analisePalavras.analisarPalavras(
      palavras, 
      carrinhoAtual, 
      mockMsg, 
      clienteId, 
      mockClient, 
      mockMessageMedia
    );
    
    if (carrinhoAtual.carrinho.length > 0) {
      const itemCarrinho = carrinhoAtual.carrinho[0];
      console.log(`✅ Item adicionado ao carrinho: ${itemCarrinho.nome} - R$ ${itemCarrinho.preco}`);
    } else {
      console.log('❌ Item não foi adicionado ao carrinho');
    }
    
    console.log('\n🎉 ITEM ADICIONADO COM SUCESSO!');
    console.log('\n📋 RESUMO:');
    console.log(`   • Item: ${novoItem.nome} (ID: ${novoId})`);
    console.log(`   • Preço: R$ ${novoItem.preco.toFixed(2)}`);
    console.log(`   • Mapeamentos: ${mapeamentosOK} configurados`);
    console.log(`   • Status: Pronto para receber pedidos`);
    
    console.log('\n💡 IMPORTANTE:');
    console.log('   • O bot precisa ser reiniciado para garantir que o cache seja atualizado');
    console.log('   • Ou aguarde 30 segundos para o cache atualizar automaticamente');
    console.log('   • Teste enviando "xfish" pelo WhatsApp para verificar');
    
    console.log('\n=== PROCESSO CONCLUÍDO ===');
    
  } catch (error) {
    console.error('❌ Erro no processo:', error);
  }
}

// Função para adicionar item personalizado
async function adicionarItemPersonalizado(nome, descricao, preco, tipo, palavrasChave) {
  console.log(`=== ADICIONANDO ITEM PERSONALIZADO: ${nome} ===`);
  
  try {
    await cardapioService.init();
    
    const novoItem = { nome, descricao, preco: parseFloat(preco), tipo };
    const novoId = cardapioService.addItem(novoItem);
    
    if (!novoId) {
      console.log('❌ Erro ao adicionar item');
      return false;
    }
    
    console.log(`✅ Item adicionado: ID ${novoId}`);
    
    // Adicionar mapeamentos
    const mapeamentos = palavrasChave.split(',').map(p => p.trim().toLowerCase());
    
    for (const mapeamento of mapeamentos) {
      if (mapeamento) {
        cardapioService.addMapping(mapeamento, novoId);
        console.log(`✅ Mapeamento: '${mapeamento}' -> ID ${novoId}`);
      }
    }
    
    console.log('\n🎉 Item personalizado adicionado com sucesso!');
    return true;
    
  } catch (error) {
    console.error('❌ Erro:', error);
    return false;
  }
}

// Executar exemplo
if (require.main === module) {
  adicionarItemCompleto();
}

module.exports = { adicionarItemCompleto, adicionarItemPersonalizado };