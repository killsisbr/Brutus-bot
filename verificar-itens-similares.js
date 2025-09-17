const cardapioService = require('./src/services/cardapioService');

async function verificarItensSimilares() {
  console.log('=== ITENS QUE PODEM SER SIMILARES A XFISH ===');
  
  try {
    await cardapioService.init();
    const items = cardapioService.getItems();
    
    console.log('\nItens com "x" no nome:');
    items.filter(item => item.nome.toLowerCase().includes('x'))
         .forEach(item => console.log(`- ID ${item.id}: ${item.nome} (${item.tipo}) - R$ ${item.preco}`));
    
    console.log('\nTodos os itens do tipo Lanche:');
    items.filter(item => item.tipo === 'Lanche')
         .forEach(item => console.log(`- ID ${item.id}: ${item.nome} - R$ ${item.preco}`));
    
    console.log('\nTodos os mapeamentos disponíveis (primeiros 20):');
    const mappings = cardapioService.getMappings();
    const mappingEntries = Object.entries(mappings).slice(0, 20);
    mappingEntries.forEach(([key, value]) => console.log(`- '${key}' -> ID ${value}`));
    
    console.log(`\nTotal de mapeamentos: ${Object.keys(mappings).length}`);
    
  } catch (error) {
    console.error('Erro:', error);
  }
}

verificarItensSimilares();