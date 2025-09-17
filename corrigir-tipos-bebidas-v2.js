const cardapioService = require('./src/services/cardapioService');
const fs = require('fs');
const path = require('path');
const initSqlJs = require('sql.js');

async function corrigirTiposBebidas() {
  console.log('=== CORRIGINDO TIPOS DE BEBIDAS V2 ===');
  
  try {
    // Inicializar o serviço
    await cardapioService.init();
    
    console.log('\n1. Identificando bebidas com tipo incorreto...');
    
    const items = cardapioService.getItems();
    const bebidasIncorretas = items.filter(item => {
      const nome = item.nome.toLowerCase();
      const isBebida = nome.includes('coca') || nome.includes('guaraná') || nome.includes('refrigerante') || nome.includes('suco') || nome.includes('água');
      return isBebida && item.tipo !== 'Bebida';
    });
    
    console.log('\nBebidas com tipo incorreto:');
    bebidasIncorretas.forEach(item => {
      console.log(`  ID ${item.id}: ${item.nome} - Tipo atual: "${item.tipo}" (deveria ser "Bebida")`);
    });
    
    if (bebidasIncorretas.length === 0) {
      console.log('\n✅ Nenhuma bebida com tipo incorreto encontrada!');
      return;
    }
    
    console.log('\n2. Corrigindo tipos diretamente no banco...');
    
    // Acessar o banco diretamente
    const DB_FILE = path.join(__dirname, 'data', 'cardapio.sqlite');
    
    if (!fs.existsSync(DB_FILE)) {
      console.error('❌ Arquivo do banco não encontrado:', DB_FILE);
      return;
    }
    
    // Inicializar SQL.js
    const SQL = await initSqlJs({ 
      locateFile: file => path.join(__dirname, 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm') 
    });
    
    // Carregar banco
    const buf = fs.readFileSync(DB_FILE);
    const db = new SQL.Database(new Uint8Array(buf));
    
    // Corrigir cada bebida
    for (const item of bebidasIncorretas) {
      try {
        const stmt = db.prepare('UPDATE items SET tipo = ? WHERE id = ?');
        stmt.run(['Bebida', item.id]);
        stmt.free();
        console.log(`  ✅ ID ${item.id}: ${item.nome} - Tipo atualizado para "Bebida"`);
      } catch (e) {
        console.error(`  ❌ Erro ao atualizar ID ${item.id}:`, e.message);
      }
    }
    
    // Salvar alterações
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_FILE, buffer);
    console.log('\n💾 Alterações salvas no banco de dados');
    
    // Fechar banco
    db.close();
    
    console.log('\n3. Verificando resultado...');
    
    // Recarregar dados
    await cardapioService.init();
    const itemsAtualizados = cardapioService.getItems();
    
    console.log('\nBebidas após correção:');
    const bebidas = itemsAtualizados.filter(item => item.tipo === 'Bebida');
    bebidas.forEach(item => {
      console.log(`  ID ${item.id}: ${item.nome} - R$ ${item.preco.toFixed(2)} (${item.tipo})`);
    });
    
    console.log('\n4. Testando mapeamento "coca lata"...');
    
    const mappings = cardapioService.getMappings();
    const cocaLataId = mappings['coca lata'];
    const cocaLataItem = itemsAtualizados.find(i => i.id === cocaLataId);
    
    console.log(`Mapeamento "coca lata" -> ID ${cocaLataId}`);
    console.log('Item correspondente:', cocaLataItem);
    
    console.log('\n5. Verificando se ainda há conflito com cardápio estático...');
    
    const cardapioEstatico = require('./src/utils/cardapio');
    const item62Estatico = cardapioEstatico.find(i => i.id === 62);
    const item62SQLite = itemsAtualizados.find(i => i.id === 62);
    
    console.log('ID 62 no cardápio estático:', item62Estatico ? `${item62Estatico.nome}` : 'NÃO ENCONTRADO');
    console.log('ID 62 no SQLite:', item62SQLite ? `${item62SQLite.nome} (${item62SQLite.tipo})` : 'NÃO ENCONTRADO');
    
    if (item62Estatico && item62SQLite && item62Estatico.nome !== item62SQLite.nome) {
      console.log('\n⚠️  CONFLITO AINDA EXISTE!');
      console.log('   O cardápio estático tem precedência na função adicionarItemAoCarrinho');
      console.log('   Solução: Modificar a ordem de busca no carrinhoService.js');
      console.log('   Ou remover/comentar itens conflitantes do cardápio estático');
    } else {
      console.log('\n✅ Conflito resolvido!');
    }
    
    console.log('\n=== CORREÇÃO CONCLUÍDA ===');
    
  } catch (error) {
    console.error('Erro na correção:', error);
  }
}

corrigirTiposBebidas();