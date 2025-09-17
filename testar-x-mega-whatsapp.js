const cardapioService = require('./src/services/cardapioService');
const analisePalavras = require('./src/core/analisePalavras');
const carrinhoService = require('./src/services/carrinhoService');

async function testarXMegaWhatsApp() {
  try {
    console.log('=== TESTANDO X-MEGA NO WHATSAPP ===');
    
    // Inicializar serviços
    await cardapioService.init();
    console.log('✅ CardapioService inicializado');
    
    // Aguardar um pouco para garantir que o cache seja atualizado
    console.log('⏳ Aguardando cache atualizar...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simular cliente
    const clienteId = 'teste-x-mega-' + Date.now();
    console.log(`\n👤 Cliente de teste: ${clienteId}`);
    
    // Verificar se o item existe
    const itens = cardapioService.getItems();
    const itemXMega = itens.find(item => 
      item.nome && item.nome.toLowerCase().includes('mega')
    );
    
    if (!itemXMega) {
      console.log('❌ Item X-Mega não encontrado');
      return;
    }
    
    console.log(`\n🔍 Item X-Mega encontrado:`);
    console.log(`   - ID: ${itemXMega.id}`);
    console.log(`   - Nome: "${itemXMega.nome}"`);
    console.log(`   - Preço: R$ ${itemXMega.preco}`);
    
    // Testar diferentes variações de pedido
    const testePedidos = [
      'x-mega',
      'xmega', 
      'mega',
      'quero um x mega',
      'vou querer 1 mega'
    ];
    
    console.log('\n🧪 Testando reconhecimento de palavras...');
    
    for (const pedido of testePedidos) {
      console.log(`\n📝 Testando: "${pedido}"`);
      
      try {
        // Testar getItemIdByName diretamente
        const itemId = await analisePalavras.getItemIdByName(pedido);
        if (itemId) {
          console.log(`   ✅ getItemIdByName: "${pedido}" -> ID ${itemId}`);
        } else {
          console.log(`   ❌ getItemIdByName: "${pedido}" -> não reconhecido`);
        }
        
        // Simular processamento completo da mensagem
        const resultado = await analisePalavras.analisarPalavras(pedido, clienteId);
        
        // Verificar carrinho após processamento
        const carrinho = carrinhoService.obterCarrinho(clienteId);
        const itemNoCarrinho = carrinho.find(item => item.id === itemXMega.id);
        
        if (itemNoCarrinho) {
          console.log(`   ✅ Adicionado ao carrinho: ${itemNoCarrinho.quantidade}x ${itemNoCarrinho.nome}`);
        } else {
          console.log(`   ❌ Não foi adicionado ao carrinho`);
        }
        
        // Limpar carrinho para próximo teste
        carrinhoService.limparCarrinho(clienteId);
        
      } catch (error) {
        console.log(`   ❌ Erro ao processar "${pedido}": ${error.message}`);
      }
    }
    
    // Teste final com pedido completo
    console.log('\n🎯 TESTE FINAL: Simulando pedido completo...');
    
    try {
      const mensagemCompleta = 'Oi, quero um x-mega por favor';
      console.log(`📱 Mensagem: "${mensagemCompleta}"`);
      
      const resultado = await analisePalavras.analisarPalavras(mensagemCompleta, clienteId);
      
      const carrinhoFinal = carrinhoService.obterCarrinho(clienteId);
      console.log('\n🛒 Carrinho final:');
      
      if (carrinhoFinal.length > 0) {
        carrinhoFinal.forEach(item => {
          console.log(`   ✅ ${item.quantidade}x ${item.nome} - R$ ${item.preco}`);
        });
        
        const total = carrinhoFinal.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
        console.log(`   💰 Total: R$ ${total.toFixed(2)}`);
        
        console.log('\n🎉 SUCESSO! X-Mega foi reconhecido e adicionado ao carrinho!');
      } else {
        console.log('   ❌ Carrinho vazio - item não foi reconhecido');
      }
      
    } catch (error) {
      console.log(`❌ Erro no teste final: ${error.message}`);
    }
    
    // Limpar dados de teste
    carrinhoService.limparCarrinho(clienteId);
    
    console.log('\n✨ Teste concluído!');
    
  } catch (error) {
    console.error('❌ Erro geral no teste:', error);
  }
}

testarXMegaWhatsApp();