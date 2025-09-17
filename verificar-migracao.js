const cardapioService = require('./src/services/cardapioService');
const cardapioEstatico = require('./src/utils/cardapio');

async function verificarMigracao() {
  console.log('=== VERIFICANDO MIGRAÇÃO ===');
  
  try {
    // Inicializar o serviço
    await cardapioService.init();
    
    const itensSQLite = cardapioService.getItems();
    const mappings = cardapioService.getMappings();
    
    console.log(`\n📊 Estatísticas:`);
    console.log(`- Itens no cardápio estático: ${cardapioEstatico.length}`);
    console.log(`- Itens no SQLite: ${itensSQLite.length}`);
    console.log(`- Mapeamentos criados: ${Object.keys(mappings).length}`);
    
    console.log(`\n🔍 Verificando alguns itens específicos:`);
    
    // Testar alguns itens importantes
    const testesItens = [
      'brutus',
      'x burguer',
      'batata palito',
      'coca lata',
      'flash'
    ];
    
    testesItens.forEach(teste => {
      const itemId = mappings[teste];
      if (itemId) {
        const item = itensSQLite.find(i => i.id === itemId);
        if (item) {
          console.log(`✅ '${teste}' -> ID ${itemId}: ${item.nome} - R$ ${item.preco.toFixed(2)}`);
        } else {
          console.log(`⚠️  '${teste}' -> ID ${itemId}: Item não encontrado`);
        }
      } else {
        console.log(`❌ '${teste}' -> Mapeamento não encontrado`);
      }
    });
    
    console.log(`\n📋 Primeiros 10 itens no SQLite:`);
    itensSQLite.slice(0, 10).forEach(item => {
      console.log(`- ID ${item.id}: ${item.nome} - R$ ${item.preco.toFixed(2)}`);
    });
    
    console.log(`\n🔗 Alguns mapeamentos criados:`);
    const mapeamentosExemplo = Object.entries(mappings).slice(0, 15);
    mapeamentosExemplo.forEach(([nome, id]) => {
      console.log(`- '${nome}' -> ID ${id}`);
    });
    
    // Verificar se todos os itens do cardápio estático foram migrados
    console.log(`\n🔍 Verificando integridade da migração:`);
    let itensFaltando = 0;
    
    cardapioEstatico.forEach(itemEstatico => {
      const itemSQLite = itensSQLite.find(i => 
        i.nome === itemEstatico.nome && 
        Math.abs(i.preco - itemEstatico.preco) < 0.01
      );
      
      if (!itemSQLite) {
        console.log(`❌ Item não encontrado no SQLite: ${itemEstatico.nome} - R$ ${itemEstatico.preco.toFixed(2)}`);
        itensFaltando++;
      }
    });
    
    if (itensFaltando === 0) {
      console.log(`✅ Todos os itens do cardápio estático foram migrados com sucesso!`);
    } else {
      console.log(`⚠️  ${itensFaltando} itens não foram encontrados no SQLite`);
    }
    
    console.log('\n=== VERIFICAÇÃO CONCLUÍDA ===');
    
  } catch (error) {
    console.error('Erro na verificação:', error);
  }
}

verificarMigracao();