const cardapioService = require('./src/services/cardapioService');
const analisePalavras = require('./src/core/analisePalavras');
const carrinhoService = require('./src/services/carrinhoService');

async function diagnosticarProblema() {
  console.log('=== DIAGNÓSTICO: PROBLEMA COM ITEM NÃO RECONHECIDO ===');
  
  try {
    // 1. Inicializar serviços
    await cardapioService.init();
    
    console.log('\n1. VERIFICANDO ESTADO ATUAL DO CARDÁPIO:');
    const items = cardapioService.getItems();
    console.log(`Total de itens no cardápio: ${items.length}`);
    
    // Mostrar últimos 10 itens adicionados
    console.log('\nÚltimos 10 itens no cardápio:');
    const ultimosItens = items.slice(-10);
    ultimosItens.forEach(item => {
      console.log(`  ID ${item.id}: ${item.nome} - R$ ${item.preco} (${item.tipo})`);
    });
    
    console.log('\n2. VERIFICANDO MAPEAMENTOS:');
    const mappings = cardapioService.getMappings();
    console.log(`Total de mapeamentos: ${Object.keys(mappings).length}`);
    
    // Mostrar últimos 20 mapeamentos
    console.log('\nÚltimos 20 mapeamentos:');
    const mappingEntries = Object.entries(mappings).slice(-20);
    mappingEntries.forEach(([key, value]) => {
      console.log(`  '${key}' -> ID ${value}`);
    });
    
    console.log('\n3. TESTANDO CACHE DE MAPEAMENTOS:');
    
    // Forçar atualização do cache
    const mapeamentosCompletos = await analisePalavras.getMapeamentosCompletos?.() || {};
    console.log(`Mapeamentos no cache: ${Object.keys(mapeamentosCompletos).length}`);
    
    console.log('\n4. PROBLEMAS COMUNS E SOLUÇÕES:');
    
    console.log('\n📋 CHECKLIST DE VERIFICAÇÃO:');
    console.log('\n✅ 1. O item foi adicionado ao cardápio SQLite?');
    console.log('   - Verificar se o item aparece na lista acima');
    console.log('   - Se não aparece, usar o script adicionar-item-cardapio.js');
    
    console.log('\n✅ 2. Os mapeamentos foram criados?');
    console.log('   - Verificar se as palavras-chave aparecem na lista de mapeamentos');
    console.log('   - Cada palavra que o cliente pode digitar precisa ter um mapeamento');
    
    console.log('\n✅ 3. O cache está atualizado?');
    console.log('   - O sistema usa cache de 30 segundos para mapeamentos');
    console.log('   - Aguardar 30 segundos após adicionar item ou reiniciar o bot');
    
    console.log('\n✅ 4. As palavras estão normalizadas?');
    console.log('   - Mapeamentos devem estar em minúsculas');
    console.log('   - Sem acentos, pontuação ou caracteres especiais');
    
    console.log('\n🔧 COMO ADICIONAR UM ITEM CORRETAMENTE:');
    console.log('\n1. Adicionar o item ao cardápio:');
    console.log('   const novoId = cardapioService.addItem({');
    console.log('     nome: "Nome do Item",');
    console.log('     descricao: "Descrição",');
    console.log('     preco: 25.00,');
    console.log('     tipo: "Lanche"');
    console.log('   });');
    
    console.log('\n2. Adicionar mapeamentos para todas as variações:');
    console.log('   cardapioService.addMapping("nome do item", novoId);');
    console.log('   cardapioService.addMapping("nome", novoId);');
    console.log('   cardapioService.addMapping("item", novoId);');
    console.log('   // Adicionar todas as formas que o cliente pode digitar');
    
    console.log('\n3. Aguardar 30 segundos ou reiniciar o bot');
    
    console.log('\n🚨 TESTE RÁPIDO:');
    console.log('Digite o nome do item que não está funcionando para testar:');
    
    // Simular alguns testes comuns
    const testesComuns = ['xfish', 'x fish', 'fish', 'peixe'];
    
    console.log('\nTestando palavras comuns que podem não funcionar:');
    for (const teste of testesComuns) {
      const itemId = await analisePalavras.getItemIdByName(teste);
      if (itemId) {
        const item = items.find(i => i.id === itemId);
        console.log(`✅ '${teste}' -> ID ${itemId} (${item ? item.nome : 'item não encontrado'})`);
      } else {
        console.log(`❌ '${teste}' -> não reconhecido`);
      }
    }
    
    console.log('\n💡 DICA IMPORTANTE:');
    console.log('Se você acabou de adicionar um item e ele não funciona:');
    console.log('1. Verifique se os mapeamentos foram criados');
    console.log('2. Aguarde 30 segundos para o cache atualizar');
    console.log('3. Ou reinicie o bot para forçar atualização');
    
    console.log('\n=== DIAGNÓSTICO CONCLUÍDO ===');
    
  } catch (error) {
    console.error('Erro no diagnóstico:', error);
  }
}

diagnosticarProblema();