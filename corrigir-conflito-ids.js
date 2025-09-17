const cardapioService = require('./src/services/cardapioService');
const cardapioEstatico = require('./src/utils/cardapio');

async function corrigirConflitoIds() {
  console.log('=== CORRIGINDO CONFLITO DE IDs ===');
  
  try {
    // Inicializar o serviço
    await cardapioService.init();
    
    console.log('\n1. Analisando conflitos entre cardápio estático e SQLite...');
    
    const itemsSQLite = cardapioService.getItems();
    const mappings = cardapioService.getMappings();
    
    console.log('\nItens no cardápio estático:');
    cardapioEstatico.forEach(item => {
      console.log(`  ID ${item.id}: ${item.nome} (${item.tipo || 'N/A'})`);
    });
    
    console.log('\nItens no SQLite:');
    itemsSQLite.forEach(item => {
      console.log(`  ID ${item.id}: ${item.nome} (${item.tipo})`);
    });
    
    console.log('\n2. Identificando conflitos específicos...');
    
    // Verificar conflitos de ID
    const conflitos = [];
    cardapioEstatico.forEach(itemEstatico => {
      const itemSQLite = itemsSQLite.find(i => i.id === itemEstatico.id);
      if (itemSQLite && itemSQLite.nome !== itemEstatico.nome) {
        conflitos.push({
          id: itemEstatico.id,
          estatico: itemEstatico.nome,
          sqlite: itemSQLite.nome
        });
      }
    });
    
    console.log('\nConflitos encontrados:');
    conflitos.forEach(conflito => {
      console.log(`  ❌ ID ${conflito.id}: Estático='${conflito.estatico}' vs SQLite='${conflito.sqlite}'`);
    });
    
    // Foco no problema específico: ID 62
    console.log('\n3. Analisando problema específico do ID 62...');
    const item62Estatico = cardapioEstatico.find(i => i.id === 62);
    const item62SQLite = itemsSQLite.find(i => i.id === 62);
    
    console.log('ID 62 no cardápio estático:', item62Estatico);
    console.log('ID 62 no SQLite:', item62SQLite);
    console.log('Mapeamento "coca lata":', mappings['coca lata']);
    
    // Verificar se existe 'Coca lata Zero' no SQLite com outro ID
    const cocaLataSQLite = itemsSQLite.find(i => i.nome.toLowerCase().includes('coca') && i.nome.toLowerCase().includes('lata'));
    console.log('\nItem Coca lata no SQLite:', cocaLataSQLite);
    
    console.log('\n4. Proposta de correção...');
    
    if (item62SQLite && item62SQLite.nome === 'Coca lata Zero') {
      console.log('\n✅ Solução 1: Atualizar o tipo do item no SQLite');
      console.log('   - Mudar tipo de "Lanche" para "Bebida" para ID 62');
      
      // Atualizar o tipo do item no SQLite
      try {
        const db = cardapioService.getDatabase();
        if (db) {
          const stmt = db.prepare('UPDATE items SET tipo = ? WHERE id = ?');
          stmt.run('Bebida', 62);
          stmt.free && stmt.free();
          console.log('   ✅ Tipo atualizado para "Bebida"');
        }
      } catch (e) {
        console.error('   ❌ Erro ao atualizar tipo:', e);
      }
    }
    
    console.log('\n✅ Solução 2: Verificar mapeamentos corretos');
    
    // Verificar todos os mapeamentos relacionados a coca
    const mapeamentosCoca = {};
    for (const [palavra, id] of Object.entries(mappings)) {
      if (palavra.includes('coca')) {
        mapeamentosCoca[palavra] = id;
      }
    }
    
    console.log('\nMapeamentos relacionados a "coca":');
    for (const [palavra, id] of Object.entries(mapeamentosCoca)) {
      const item = itemsSQLite.find(i => i.id === id);
      console.log(`  "${palavra}" -> ID ${id}: ${item ? item.nome : 'ITEM NÃO ENCONTRADO'} (${item ? item.tipo : 'N/A'})`);
    }
    
    console.log('\n5. Testando correção...');
    
    // Recarregar itens após atualização
    await cardapioService.init();
    const itemsAtualizados = cardapioService.getItems();
    const item62Atualizado = itemsAtualizados.find(i => i.id === 62);
    
    console.log('Item ID 62 após correção:', item62Atualizado);
    
    console.log('\n=== CORREÇÃO CONCLUÍDA ===');
    
  } catch (error) {
    console.error('Erro na correção:', error);
  }
}

corrigirConflitoIds();