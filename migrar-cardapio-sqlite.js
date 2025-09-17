const cardapioService = require('./src/services/cardapioService');
const cardapioEstatico = require('./src/utils/cardapio');

async function migrarCardapioParaSQLite() {
  console.log('=== MIGRANDO CARDÁPIO ESTÁTICO PARA SQLITE ===');
  
  try {
    // Inicializar o serviço
    await cardapioService.init();
    
    console.log(`\nTotal de itens no cardápio estático: ${cardapioEstatico.length}`);
    
    let sucessos = 0;
    let erros = 0;
    
    for (const item of cardapioEstatico) {
      try {
        // Verificar se o item já existe no banco
        const itensExistentes = cardapioService.getItems();
        const itemExistente = itensExistentes.find(i => i.id === item.id);
        
        if (itemExistente) {
          console.log(`⚠️  Item já existe: ID ${item.id} - ${item.nome}`);
          continue;
        }
        
        // Adicionar item ao banco
        const novoId = cardapioService.addItem({
          nome: item.nome,
          descricao: item.descricao || '',
          preco: item.preco,
          tipo: 'Lanche'
        });
        
        if (novoId) {
          console.log(`✅ Adicionado: ID ${novoId} - ${item.nome} - R$ ${item.preco.toFixed(2)}`);
          
          // Criar mapeamentos básicos
          const nomeSimplificado = item.nome.toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .trim();
          
          const gatilhos = [
            nomeSimplificado,
            nomeSimplificado.replace(/\s+/g, ''),
            ...nomeSimplificado.split(' ').filter(palavra => palavra.length > 2)
          ];
          
          // Adicionar mapeamentos específicos baseados no nome
          if (item.nome.includes('Brutus')) {
            gatilhos.push('brutus');
          }
          if (item.nome.includes('X-')) {
            const xNome = item.nome.replace('X-', '').toLowerCase();
            gatilhos.push(`x ${xNome}`, `x-${xNome}`, `x${xNome}`);
          }
          if (item.nome.includes('Batata')) {
            gatilhos.push('batata', 'bat');
            if (item.nome.includes('palito')) gatilhos.push('palito');
            if (item.nome.includes('Crinkle')) gatilhos.push('crinkle', 'kinkle');
            if (item.nome.includes('pequena')) gatilhos.push('pequena');
          }
          if (item.nome.includes('Coca')) {
            gatilhos.push('coca', 'cola');
            if (item.nome.includes('lata')) gatilhos.push('coca lata');
            if (item.nome.includes('2L')) gatilhos.push('coca 2l', 'coca 2 litros');
          }
          if (item.nome.includes('Guaraná')) {
            gatilhos.push('guarana', 'guaraná');
            if (item.nome.includes('lata')) gatilhos.push('guarana lata');
            if (item.nome.includes('2L')) gatilhos.push('guarana 2l', 'guaraná 2l');
          }
          if (item.nome.includes('Onion')) {
            gatilhos.push('onion', 'rings', 'onion rings');
          }
          
          // Remover duplicatas
          const gatilhosUnicos = [...new Set(gatilhos.filter(g => g && g.length > 1))];
          
          if (gatilhosUnicos.length > 0) {
            cardapioService.addMultipleMappings(gatilhosUnicos, novoId);
            console.log(`   Mapeamentos: ${gatilhosUnicos.join(', ')}`);
          }
          
          sucessos++;
        } else {
          console.log(`❌ Erro ao adicionar: ${item.nome}`);
          erros++;
        }
        
      } catch (error) {
        console.error(`❌ Erro ao processar item ${item.nome}:`, error.message);
        erros++;
      }
    }
    
    console.log(`\n=== RESUMO DA MIGRAÇÃO ===`);
    console.log(`✅ Sucessos: ${sucessos}`);
    console.log(`❌ Erros: ${erros}`);
    console.log(`📊 Total processado: ${sucessos + erros}`);
    
    // Verificar resultado final
    const itensFinal = cardapioService.getItems();
    const mapeamentosFinal = cardapioService.getMappings();
    
    console.log(`\n📋 Itens no banco: ${itensFinal.length}`);
    console.log(`🔗 Mapeamentos criados: ${Object.keys(mapeamentosFinal).length}`);
    
    console.log('\n=== MIGRAÇÃO CONCLUÍDA ===');
    
  } catch (error) {
    console.error('Erro na migração:', error);
  }
}

migrarCardapioParaSQLite();