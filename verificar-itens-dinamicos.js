const cardapioService = require('./src/services/cardapioService');

async function verificarItensDinamicos() {
  console.log('=== Verificando itens dinâmicos ===');
  
  try {
    // Inicializar o serviço
    await cardapioService.init();
    
    // Verificar todos os itens dinâmicos
    const itensDinamicos = cardapioService.getItems();
    console.log('\nItens dinâmicos encontrados:');
    
    if (itensDinamicos.length === 0) {
      console.log('Nenhum item dinâmico encontrado.');
    } else {
      itensDinamicos.forEach(item => {
        console.log(`ID: ${item.id}, Nome: ${item.nome}, Preço: R$ ${item.preco.toFixed(2)}`);
      });
    }
    
    // Verificar mapeamentos
    console.log('\n=== Verificando mapeamentos ===');
    const mappings = cardapioService.getMappings();
    
    console.log('Todos os mapeamentos:');
    Object.entries(mappings).forEach(([nome, itemId]) => {
      console.log(`'${nome}' -> ID ${itemId}`);
    });
    
    // Verificar especificamente flash e bat
    const flashMapping = mappings['flash'];
    const batMapping = mappings['bat'];
    
    console.log(`\nMapeamento 'flash': ${flashMapping}`);
    console.log(`Mapeamento 'bat': ${batMapping}`);
    
    // Verificar se os itens mapeados existem
    if (flashMapping) {
      const flashItem = itensDinamicos.find(item => item.id === flashMapping);
      if (flashItem) {
        console.log(`Item Flash encontrado: ID ${flashItem.id}, Nome: ${flashItem.nome}, Preço: R$ ${flashItem.preco.toFixed(2)}`);
      } else {
        console.log(`PROBLEMA: Mapeamento 'flash' aponta para ID ${flashMapping} que não existe!`);
      }
    }
    
    if (batMapping) {
      const batItem = itensDinamicos.find(item => item.id === batMapping);
      if (batItem) {
        console.log(`Item Bat encontrado: ID ${batItem.id}, Nome: ${batItem.nome}, Preço: R$ ${batItem.preco.toFixed(2)}`);
      } else {
        console.log(`PROBLEMA: Mapeamento 'bat' aponta para ID ${batMapping} que não existe!`);
      }
    }
    
  } catch (error) {
    console.error('Erro ao verificar itens dinâmicos:', error);
  }
}

verificarItensDinamicos();