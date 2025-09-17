const cardapioService = require('./src/services/cardapioService');
const cardapioEstatico = require('./src/utils/cardapio');
const analisePalavras = require('./src/core/analisePalavras');

async function testarSistemaFinal() {
  console.log('=== TESTE FINAL DO SISTEMA ===');
  
  try {
    // Inicializar serviços
    await cardapioService.init();
    
    console.log('\n1. Testando cardápio estático (alguns itens):');
    const itensEstaticos = [
      { nome: 'Brutus Burguer', id: 51 },
      { nome: 'X-Burguer', id: 61 },
      { nome: 'Batata palito', id: 68 },
      { nome: 'Queijo', id: 20 },
      { nome: 'Coca lata', id: 1031 }
    ];
    
    itensEstaticos.forEach(({ nome, id }) => {
      const item = cardapioEstatico.find(i => i.id === id);
      if (item) {
        console.log(`✓ ${nome}: R$ ${item.preco.toFixed(2)}`);
      } else {
        console.log(`✗ ${nome}: NÃO ENCONTRADO`);
      }
    });
    
    console.log('\n2. Testando itens dinâmicos:');
    const itensDinamicos = cardapioService.getItems();
    console.log(`Total de itens dinâmicos: ${itensDinamicos.length}`);
    
    // Testar Flash especificamente
    const mappings = cardapioService.getMappings();
    const flashId = mappings['flash'];
    if (flashId) {
      const flashItem = itensDinamicos.find(item => item.id === flashId);
      if (flashItem) {
        console.log(`✓ Flash: ID ${flashItem.id}, Preço: R$ ${flashItem.preco.toFixed(2)}`);
      } else {
        console.log(`✗ Flash: Mapeamento existe (ID ${flashId}) mas item não encontrado`);
      }
    } else {
      console.log('✗ Flash: Mapeamento não encontrado');
    }
    
    // Testar Bat
    const batId = mappings['bat'];
    if (batId) {
      const batItem = itensDinamicos.find(item => item.id === batId);
      if (batItem) {
        console.log(`✓ Bat: ID ${batItem.id}, Nome: ${batItem.nome}, Preço: R$ ${batItem.preco.toFixed(2)}`);
      } else {
        console.log(`✗ Bat: Mapeamento existe (ID ${batId}) mas item não encontrado`);
      }
    } else {
      console.log('✗ Bat: Mapeamento não encontrado');
    }
    
    console.log('\n3. Testando reconhecimento de palavras:');
    const testePalavras = ['flash', 'bat', 'brutus', 'coca'];
    
    testePalavras.forEach(palavra => {
      const itemId = analisePalavras.getItemIdByName(palavra);
      if (itemId) {
        console.log(`✓ '${palavra}' -> ID ${itemId}`);
      } else {
        console.log(`✗ '${palavra}' -> Não reconhecido`);
      }
    });
    
    console.log('\n4. Resumo dos preços atualizados:');
    console.log('Hambúrguers principais:');
    console.log('- Brutus Burguer: R$ 22,00 (era R$ 18,00)');
    console.log('- Brutus Salada: R$ 25,00 (era R$ 20,00)');
    console.log('- Big Brutus: R$ 42,00 (era R$ 35,00)');
    
    console.log('\nLanches X:');
    console.log('- X-Burguer: R$ 16,00 (era R$ 13,00)');
    console.log('- X-Tudo: R$ 32,00 (era R$ 27,00)');
    
    console.log('\nPorções:');
    console.log('- Batata palito: R$ 24,00 (era R$ 20,00)');
    console.log('- Onion Rings: R$ 28,00 (era R$ 23,00)');
    
    console.log('\nBebidas:');
    console.log('- Coca lata: R$ 7,00 (era R$ 6,00)');
    console.log('- Coca 2L: R$ 15,00 (era R$ 13,00)');
    
    console.log('\nAdicionais:');
    console.log('- Queijo: R$ 6,00 (era R$ 5,00)');
    console.log('- Bacon: R$ 7,00 (era R$ 5,00)');
    
    console.log('\nItens dinâmicos:');
    console.log('- Flash: R$ 28,00 (era R$ 23,00)');
    
    console.log('\n=== TESTE CONCLUÍDO ===');
    
  } catch (error) {
    console.error('Erro no teste final:', error);
  }
}

testarSistemaFinal();