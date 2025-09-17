const cardapioService = require('./src/services/cardapioService');

async function verificarXMega() {
  try {
    console.log('=== VERIFICANDO X-MEGA ===');
    
    // Inicializar o serviço
    await cardapioService.init();
    console.log('✅ CardapioService inicializado');
    
    // Buscar todos os itens
    const itens = cardapioService.getItems();
    console.log(`📋 Total de itens no cardápio: ${itens.length}`);
    
    // Procurar por itens com "mega" no nome
    const itensMega = itens.filter(item => 
      item.nome && item.nome.toLowerCase().includes('mega')
    );
    console.log('\n🔍 Itens com "mega" encontrados:');
    itensMega.forEach(item => {
      console.log(`  - ID: ${item.id}, Nome: "${item.nome}", Preço: R$ ${item.preco}, Tipo: ${item.tipo}`);
    });
    
    // Buscar todos os mapeamentos
    const mappings = cardapioService.getMappings();
    const mappingKeys = Object.keys(mappings);
    console.log(`\n📝 Total de mapeamentos: ${mappingKeys.length}`);
    
    // Procurar por mapeamentos com "mega"
    const megaMappings = mappingKeys.filter(key => 
      key.includes('mega') || key.includes('x-mega')
    );
    console.log('\n🔗 Mapeamentos com "mega" encontrados:');
    megaMappings.forEach(key => {
      console.log(`  - "${key}" -> Item ID: ${mappings[key]}`);
    });
    
    // Verificar se existe item com ID 222 (conforme a imagem)
    const item222 = itens.find(item => item.id === 222);
    console.log('\n🎯 Item com ID 222:');
    if (item222) {
      console.log(`  - Nome: "${item222.nome}", Preço: R$ ${item222.preco}, Tipo: ${item222.tipo}`);
    } else {
      console.log('  - ❌ Não encontrado');
    }
    
    // Verificar mapeamentos para "x-mega", "xmega", "mega"
    const testWords = ['x-mega', 'xmega', 'mega', 'x mega'];
    console.log('\n🧪 Testando palavras específicas:');
    testWords.forEach(word => {
      const itemId = mappings[word.toLowerCase()];
      if (itemId) {
        console.log(`  - "${word}" -> Item ID: ${itemId} ✅`);
      } else {
        console.log(`  - "${word}" -> Não mapeado ❌`);
      }
    });
    
    console.log('\n=== DIAGNÓSTICO ===');
    if (itensMega.length === 0) {
      console.log('❌ PROBLEMA: Nenhum item com "mega" encontrado no cardápio');
      console.log('💡 SOLUÇÃO: Adicionar o item "X-Mega" ao cardápio');
    } else {
      console.log('✅ Item(s) com "mega" encontrado(s)');
    }
    
    if (megaMappings.length === 0) {
      console.log('❌ PROBLEMA: Nenhum mapeamento para "mega" encontrado');
      console.log('💡 SOLUÇÃO: Criar mapeamentos para "x-mega", "xmega", "mega"');
    } else {
      console.log('✅ Mapeamento(s) para "mega" encontrado(s)');
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar x-mega:', error);
  }
}

verificarXMega();