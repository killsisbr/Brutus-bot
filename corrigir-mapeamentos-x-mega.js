const cardapioService = require('./src/services/cardapioService');

async function corrigirMapeamentosXMega() {
  try {
    console.log('=== CORRIGINDO MAPEAMENTOS X-MEGA ===');
    
    // Inicializar o serviço
    await cardapioService.init();
    console.log('✅ CardapioService inicializado');
    
    // Encontrar o item X-Mega
    const itens = cardapioService.getItems();
    const itemXMega = itens.find(item => 
      item.nome && item.nome.toLowerCase().includes('mega')
    );
    
    if (!itemXMega) {
      console.log('❌ Item X-Mega não encontrado no cardápio');
      return;
    }
    
    console.log(`\n🔍 Item X-Mega encontrado:`);
    console.log(`   - ID: ${itemXMega.id}`);
    console.log(`   - Nome: "${itemXMega.nome}"`);
    console.log(`   - Preço: R$ ${itemXMega.preco}`);
    
    // Mapeamentos que precisam ser corrigidos
    const mapeamentos = [
      'x-mega',
      'xmega', 
      'mega',
      'x mega',
      'megax',
      'x-megax',
      'xmegax'
    ];
    
    console.log('\n🔧 Corrigindo mapeamentos para o ID correto...');
    let mapeamentosCorrigidos = 0;
    
    for (const palavra of mapeamentos) {
      const sucesso = cardapioService.addMapping(palavra, itemXMega.id);
      if (sucesso) {
        console.log(`✅ Mapeamento "${palavra}" -> ID ${itemXMega.id}`);
        mapeamentosCorrigidos++;
      } else {
        console.log(`❌ Erro ao corrigir mapeamento "${palavra}"`);
      }
    }
    
    console.log(`\n📊 Resumo: ${mapeamentosCorrigidos}/${mapeamentos.length} mapeamentos corrigidos`);
    
    // Verificar se os mapeamentos estão corretos agora
    console.log('\n🔍 Verificando mapeamentos corrigidos...');
    const mappings = cardapioService.getMappings();
    
    for (const palavra of mapeamentos) {
      const itemId = mappings[palavra.toLowerCase()];
      if (itemId === itemXMega.id) {
        console.log(`✅ "${palavra}" -> ID ${itemId} (correto)`);
      } else {
        console.log(`❌ "${palavra}" -> ID ${itemId} (incorreto, deveria ser ${itemXMega.id})`);
      }
    }
    
    console.log('\n🎉 Mapeamentos corrigidos com sucesso!');
    console.log('💡 Agora o cliente pode pedir "x-mega" e será reconhecido corretamente');
    console.log('⚠️  Aguarde 30 segundos ou reinicie o bot para o cache atualizar');
    
  } catch (error) {
    console.error('❌ Erro ao corrigir mapeamentos:', error);
  }
}

corrigirMapeamentosXMega();