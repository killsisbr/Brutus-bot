const cardapioService = require('./src/services/cardapioService');

async function verificarCocaLata() {
  console.log('=== VERIFICANDO MAPEAMENTO COCA LATA ===');
  
  try {
    await cardapioService.init();
    
    const mappings = cardapioService.getMappings();
    const items = cardapioService.getItems();
    
    console.log('\n🔍 Mapeamentos relacionados a coca:');
    Object.keys(mappings)
      .filter(k => k.includes('coca'))
      .forEach(k => {
        const itemId = mappings[k];
        const item = items.find(i => i.id === itemId);
        console.log(`'${k}' -> ID ${itemId}: ${item ? item.nome + ' - R$ ' + item.preco.toFixed(2) : 'Item não encontrado'}`);
      });
    
    console.log('\n🥤 Todos os itens de bebida:');
    items
      .filter(i => i.tipo === 'Bebida')
      .forEach(i => console.log(`ID ${i.id}: ${i.nome} - R$ ${i.preco.toFixed(2)}`));
    
    console.log('\n🔍 Testando busca específica por "coca lata":');
    const cocaLataId = mappings['coca lata'];
    if (cocaLataId) {
      const item = items.find(i => i.id === cocaLataId);
      console.log(`✅ 'coca lata' -> ID ${cocaLataId}: ${item.nome} - R$ ${item.preco.toFixed(2)}`);
    } else {
      console.log(`❌ 'coca lata' -> Mapeamento não encontrado`);
    }
    
    console.log('\n🔍 Testando variações:');
    const variacoes = ['coca', 'lata', 'coca lata', 'coca-cola lata', 'coca cola lata'];
    variacoes.forEach(variacao => {
      const itemId = mappings[variacao];
      if (itemId) {
        const item = items.find(i => i.id === itemId);
        console.log(`✅ '${variacao}' -> ID ${itemId}: ${item ? item.nome : 'Item não encontrado'}`);
      } else {
        console.log(`❌ '${variacao}' -> Não encontrado`);
      }
    });
    
  } catch (error) {
    console.error('Erro:', error);
  }
}

verificarCocaLata();