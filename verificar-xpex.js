const cardapioService = require('./src/services/cardapioService');

async function verificarXpex() {
  try {
    console.log('=== VERIFICANDO XPEX ===');
    
    // Inicializar o serviço
    await cardapioService.init();
    console.log('✅ CardapioService inicializado');
    
    // Buscar todos os itens
    const itens = cardapioService.getItems();
    console.log(`📋 Total de itens no cardápio: ${itens.length}`);
    
    // Buscar todos os mapeamentos
    const mappings = cardapioService.getMappings();
    const mappingKeys = Object.keys(mappings);
    console.log(`📝 Total de mapeamentos: ${mappingKeys.length}`);
    
    // Verificar se existe mapeamento para 'xpex'
    console.log('\n🔍 Verificando mapeamento para "xpex":');
    const xpexItemId = mappings['xpex'];
    
    if (xpexItemId) {
      console.log(`✅ Mapeamento encontrado: "xpex" -> Item ID: ${xpexItemId}`);
      
      // Buscar o item correspondente
      const item = itens.find(i => i.id === xpexItemId);
      if (item) {
        console.log(`📦 Item encontrado:`);
        console.log(`   - ID: ${item.id}`);
        console.log(`   - Nome: "${item.nome}"`);
        console.log(`   - Descrição: "${item.descricao}"`);
        console.log(`   - Preço: R$ ${item.preco}`);
        console.log(`   - Tipo: ${item.tipo}`);
      } else {
        console.log(`❌ PROBLEMA: Item com ID ${xpexItemId} não encontrado no cardápio!`);
      }
    } else {
      console.log('❌ Mapeamento "xpex" não encontrado');
    }
    
    // Procurar por itens que podem ser relacionados a 'xpex'
    console.log('\n🔍 Procurando itens similares a "xpex":');
    const itensSimilares = itens.filter(item => 
      item.nome && (
        item.nome.toLowerCase().includes('x') ||
        item.nome.toLowerCase().includes('pex') ||
        item.nome.toLowerCase().includes('fish') ||
        item.nome.toLowerCase().includes('frango')
      )
    );
    
    if (itensSimilares.length > 0) {
      console.log('📋 Itens similares encontrados:');
      itensSimilares.forEach(item => {
        console.log(`   - ID: ${item.id}, Nome: "${item.nome}", Tipo: ${item.tipo}, Preço: R$ ${item.preco}`);
      });
    } else {
      console.log('❌ Nenhum item similar encontrado');
    }
    
    // Procurar por mapeamentos que contenham 'x' ou 'pex'
    console.log('\n🔍 Procurando mapeamentos similares:');
    const mapeamentosSimilares = mappingKeys.filter(key => 
      key.includes('x') || key.includes('pex') || key.includes('fish')
    );
    
    if (mapeamentosSimilares.length > 0) {
      console.log('📝 Mapeamentos similares encontrados:');
      mapeamentosSimilares.slice(0, 10).forEach(key => {
        const itemId = mappings[key];
        const item = itens.find(i => i.id === itemId);
        console.log(`   - "${key}" -> ID ${itemId}: ${item ? item.nome : 'Item não encontrado'}`);
      });
      
      if (mapeamentosSimilares.length > 10) {
        console.log(`   ... e mais ${mapeamentosSimilares.length - 10} mapeamentos`);
      }
    } else {
      console.log('❌ Nenhum mapeamento similar encontrado');
    }
    
    // Testar normalização
    console.log('\n🧪 Testando normalização de "xpex":');
    const normalize = (s) => String(s || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // remove diacríticos
      .replace(/[^\w\s]/g, ' ') // substitui pontuação por espaço
      .replace(/\s+/g, ' ')
      .trim();
    
    const xpexNormalizado = normalize('xpex');
    console.log(`   - "xpex" normalizado: "${xpexNormalizado}"`);
    
    const xpexMapeamentoNormalizado = mappings[xpexNormalizado];
    if (xpexMapeamentoNormalizado) {
      console.log(`✅ Mapeamento normalizado encontrado: "${xpexNormalizado}" -> ID ${xpexMapeamentoNormalizado}`);
    } else {
      console.log(`❌ Mapeamento normalizado não encontrado`);
    }
    
    console.log('\n=== DIAGNÓSTICO ===');
    if (!xpexItemId) {
      console.log('❌ PROBLEMA PRINCIPAL: Mapeamento "xpex" não existe');
      console.log('💡 SOLUÇÕES POSSÍVEIS:');
      console.log('   1. Verificar se existe um item no cardápio que deveria ser mapeado para "xpex"');
      console.log('   2. Adicionar o mapeamento manualmente usando cardapioService.addMapping("xpex", itemId)');
      console.log('   3. Verificar se o item foi removido ou se o ID mudou');
    } else {
      const item = itens.find(i => i.id === xpexItemId);
      if (!item) {
        console.log('❌ PROBLEMA: Mapeamento existe mas item não foi encontrado');
        console.log('💡 SOLUÇÃO: Verificar integridade do banco de dados');
      } else {
        console.log('✅ Mapeamento e item existem - problema pode estar no cache ou processamento');
        console.log('💡 SOLUÇÕES:');
        console.log('   1. Aguardar 30 segundos para o cache atualizar');
        console.log('   2. Reiniciar o bot');
        console.log('   3. Verificar se a palavra está sendo processada corretamente');
      }
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar xpex:', error);
  }
}

verificarXpex();