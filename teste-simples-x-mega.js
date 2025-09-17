const cardapioService = require('./src/services/cardapioService');

async function testeSimples() {
  try {
    console.log('=== TESTE SIMPLES X-MEGA ===');
    
    // Inicializar o serviço
    await cardapioService.init();
    console.log('✅ CardapioService inicializado');
    
    // Verificar se o item existe
    const itens = cardapioService.getItems();
    const itemXMega = itens.find(item => 
      item.nome && item.nome.toLowerCase().includes('mega')
    );
    
    console.log('\n🔍 Status do X-Mega:');
    if (itemXMega) {
      console.log(`✅ Item encontrado:`);
      console.log(`   - ID: ${itemXMega.id}`);
      console.log(`   - Nome: "${itemXMega.nome}"`);
      console.log(`   - Preço: R$ ${itemXMega.preco}`);
      console.log(`   - Tipo: ${itemXMega.tipo}`);
    } else {
      console.log('❌ Item X-Mega não encontrado');
      return;
    }
    
    // Verificar mapeamentos
    const mappings = cardapioService.getMappings();
    const testWords = ['x-mega', 'xmega', 'mega', 'x mega'];
    
    console.log('\n🔗 Status dos mapeamentos:');
    let mapeamentosCorretos = 0;
    
    for (const word of testWords) {
      const itemId = mappings[word.toLowerCase()];
      if (itemId === itemXMega.id) {
        console.log(`✅ "${word}" -> ID ${itemId} (correto)`);
        mapeamentosCorretos++;
      } else if (itemId) {
        console.log(`⚠️  "${word}" -> ID ${itemId} (incorreto, deveria ser ${itemXMega.id})`);
      } else {
        console.log(`❌ "${word}" -> não mapeado`);
      }
    }
    
    console.log(`\n📊 Resumo: ${mapeamentosCorretos}/${testWords.length} mapeamentos corretos`);
    
    // Teste de busca direta
    console.log('\n🔍 Teste de busca direta:');
    
    // Simular busca como o sistema faria
    function buscarItemPorPalavra(palavra) {
      const palavraLimpa = palavra.toLowerCase().trim();
      const itemId = mappings[palavraLimpa];
      
      if (itemId) {
        const item = itens.find(i => i.id === itemId);
        return item;
      }
      
      return null;
    }
    
    for (const word of testWords) {
      const itemEncontrado = buscarItemPorPalavra(word);
      if (itemEncontrado) {
        console.log(`✅ "${word}" encontrou: ${itemEncontrado.nome} (ID: ${itemEncontrado.id})`);
      } else {
        console.log(`❌ "${word}" não encontrou nenhum item`);
      }
    }
    
    // Diagnóstico final
    console.log('\n=== DIAGNÓSTICO FINAL ===');
    
    if (itemXMega && mapeamentosCorretos === testWords.length) {
      console.log('🎉 TUDO FUNCIONANDO!');
      console.log('✅ Item X-Mega existe no cardápio');
      console.log('✅ Todos os mapeamentos estão corretos');
      console.log('💡 O cliente pode pedir usando: x-mega, xmega, mega, x mega');
      console.log('⚠️  Se ainda não funciona no WhatsApp, aguarde 30 segundos ou reinicie o bot');
    } else {
      console.log('❌ AINDA HÁ PROBLEMAS:');
      if (!itemXMega) {
        console.log('   - Item X-Mega não existe no cardápio');
      }
      if (mapeamentosCorretos < testWords.length) {
        console.log(`   - Apenas ${mapeamentosCorretos}/${testWords.length} mapeamentos estão corretos`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

testeSimples();