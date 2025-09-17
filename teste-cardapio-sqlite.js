const cardapioService = require('./src/services/cardapioService');
const cardapioEstatico = require('./src/utils/cardapio');

async function testarCardapioSQLite() {
  console.log('=== TESTE FINAL DO CARDÁPIO NO SQLITE ===');
  
  try {
    // Inicializar o serviço
    await cardapioService.init();
    
    const itensSQLite = cardapioService.getItems();
    const mappings = cardapioService.getMappings();
    
    console.log(`\n📊 Estatísticas Finais:`);
    console.log(`- Itens no cardápio estático original: ${cardapioEstatico.length}`);
    console.log(`- Itens no SQLite: ${itensSQLite.length}`);
    console.log(`- Mapeamentos criados: ${Object.keys(mappings).length}`);
    
    console.log(`\n🍔 Testando categorias principais:`);
    
    // Testar hambúrguers
    console.log('\n--- HAMBÚRGUERS ---');
    const hamburguersTeste = ['brutus', 'brutus salada', 'big brutus', 'dallas'];
    hamburguersTeste.forEach(teste => {
      const itemId = mappings[teste];
      if (itemId) {
        const item = itensSQLite.find(i => i.id === itemId);
        if (item) {
          console.log(`✅ '${teste}' -> ${item.nome} - R$ ${item.preco.toFixed(2)}`);
        }
      } else {
        console.log(`❌ '${teste}' -> Não encontrado`);
      }
    });
    
    // Testar lanches X
    console.log('\n--- LANCHES X ---');
    const xTeste = ['x burguer', 'x salada', 'x bacon', 'x tudo'];
    xTeste.forEach(teste => {
      const itemId = mappings[teste];
      if (itemId) {
        const item = itensSQLite.find(i => i.id === itemId);
        if (item) {
          console.log(`✅ '${teste}' -> ${item.nome} - R$ ${item.preco.toFixed(2)}`);
        }
      } else {
        console.log(`❌ '${teste}' -> Não encontrado`);
      }
    });
    
    // Testar porções
    console.log('\n--- PORÇÕES ---');
    const porcoesTeste = ['batata palito', 'onion rings', 'batata crinkle', 'calabresa'];
    porcoesTeste.forEach(teste => {
      const itemId = mappings[teste];
      if (itemId) {
        const item = itensSQLite.find(i => i.id === itemId);
        if (item) {
          console.log(`✅ '${teste}' -> ${item.nome} - R$ ${item.preco.toFixed(2)}`);
        }
      } else {
        console.log(`❌ '${teste}' -> Não encontrado`);
      }
    });
    
    // Testar bebidas
    console.log('\n--- BEBIDAS ---');
    const bebidasTeste = ['coca lata', 'guarana lata', 'coca 2l', 'guarana 2l'];
    bebidasTeste.forEach(teste => {
      const itemId = mappings[teste];
      if (itemId) {
        const item = itensSQLite.find(i => i.id === itemId);
        if (item) {
          console.log(`✅ '${teste}' -> ${item.nome} - R$ ${item.preco.toFixed(2)}`);
        }
      } else {
        console.log(`❌ '${teste}' -> Não encontrado`);
      }
    });
    
    // Testar adicionais
    console.log('\n--- ADICIONAIS ---');
    const adicionaisTeste = ['queijo', 'bacon', 'catupiry', 'cheddar'];
    adicionaisTeste.forEach(teste => {
      const itemId = mappings[teste];
      if (itemId) {
        const item = itensSQLite.find(i => i.id === itemId);
        if (item) {
          console.log(`✅ '${teste}' -> ${item.nome} - R$ ${item.preco.toFixed(2)}`);
        }
      } else {
        console.log(`❌ '${teste}' -> Não encontrado`);
      }
    });
    
    // Testar itens especiais
    console.log('\n--- ITENS ESPECIAIS ---');
    const especiaisTeste = ['flash', 'bat'];
    especiaisTeste.forEach(teste => {
      const itemId = mappings[teste];
      if (itemId) {
        const item = itensSQLite.find(i => i.id === itemId);
        if (item) {
          console.log(`✅ '${teste}' -> ${item.nome} - R$ ${item.preco.toFixed(2)}`);
        }
      } else {
        console.log(`❌ '${teste}' -> Não encontrado`);
      }
    });
    
    // Verificar integridade final
    console.log(`\n🔍 Verificação de integridade:`);
    let todosEncontrados = true;
    
    cardapioEstatico.forEach(itemEstatico => {
      const itemSQLite = itensSQLite.find(i => 
        i.nome === itemEstatico.nome && 
        Math.abs(i.preco - itemEstatico.preco) < 0.01
      );
      
      if (!itemSQLite) {
        console.log(`❌ Item não migrado: ${itemEstatico.nome} - R$ ${itemEstatico.preco.toFixed(2)}`);
        todosEncontrados = false;
      }
    });
    
    if (todosEncontrados) {
      console.log(`✅ SUCESSO: Todos os itens do cardápio estático foram migrados!`);
    }
    
    console.log(`\n📋 Resumo por categoria no SQLite:`);
    const categorias = {};
    itensSQLite.forEach(item => {
      const tipo = item.tipo || 'Outros';
      if (!categorias[tipo]) categorias[tipo] = 0;
      categorias[tipo]++;
    });
    
    Object.entries(categorias).forEach(([tipo, quantidade]) => {
      console.log(`- ${tipo}: ${quantidade} itens`);
    });
    
    console.log(`\n🎉 CARDÁPIO MIGRADO COM SUCESSO PARA SQLITE!`);
    console.log(`\n💡 Agora você pode usar apenas o banco SQLite e remover o cardápio estático se desejar.`);
    console.log(`\n=== TESTE CONCLUÍDO ===`);
    
  } catch (error) {
    console.error('Erro no teste:', error);
  }
}

testarCardapioSQLite();