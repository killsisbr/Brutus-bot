const cardapioService = require('./src/services/cardapioService');
const cardapioEstatico = require('./src/utils/cardapio');

async function completarMigracao() {
  console.log('=== COMPLETANDO MIGRAÇÃO - ADICIONAIS ===');
  
  try {
    // Inicializar o serviço
    await cardapioService.init();
    
    // Itens que faltaram (adicionais com preços atualizados)
    const itensFaltantes = [
      { nome: 'Queijo', preco: 6.00, descricao: 'Adicional queijo' },
      { nome: 'Bacon', preco: 7.00, descricao: 'Adicional bacon' },
      { nome: 'Catupiry', preco: 8.00, descricao: 'Adicional catupiry' },
      { nome: 'Molho de cheddar', preco: 8.00, descricao: 'Adicional molho de cheddar' }
    ];
    
    console.log(`\nAdicionando ${itensFaltantes.length} itens faltantes...`);
    
    for (const item of itensFaltantes) {
      try {
        // Adicionar item ao banco
        const novoId = cardapioService.addItem({
          nome: item.nome,
          descricao: item.descricao,
          preco: item.preco,
          tipo: 'Adicional'
        });
        
        if (novoId) {
          console.log(`✅ Adicionado: ID ${novoId} - ${item.nome} - R$ ${item.preco.toFixed(2)}`);
          
          // Criar mapeamentos para adicionais
          const gatilhos = [];
          const nomeSimplificado = item.nome.toLowerCase();
          
          gatilhos.push(nomeSimplificado);
          gatilhos.push(nomeSimplificado.replace(/\s+/g, ''));
          gatilhos.push(`adicional ${nomeSimplificado}`);
          gatilhos.push(`adicional de ${nomeSimplificado}`);
          
          if (item.nome === 'Queijo') {
            gatilhos.push('queijo', 'adicional queijo', 'adicional de queijo', 'mais queijo');
          } else if (item.nome === 'Bacon') {
            gatilhos.push('bacon', 'adicional bacon', 'adicional de bacon', 'mais bacon');
          } else if (item.nome === 'Catupiry') {
            gatilhos.push('catupiry', 'adicional catupiry', 'adicional de catupiry', 'mais catupiry');
          } else if (item.nome === 'Molho de cheddar') {
            gatilhos.push('cheddar', 'molho cheddar', 'adicional cheddar', 'molho de cheddar');
          }
          
          // Remover duplicatas
          const gatilhosUnicos = [...new Set(gatilhos.filter(g => g && g.length > 1))];
          
          if (gatilhosUnicos.length > 0) {
            cardapioService.addMultipleMappings(gatilhosUnicos, novoId);
            console.log(`   Mapeamentos: ${gatilhosUnicos.join(', ')}`);
          }
          
        } else {
          console.log(`❌ Erro ao adicionar: ${item.nome}`);
        }
        
      } catch (error) {
        console.error(`❌ Erro ao processar item ${item.nome}:`, error.message);
      }
    }
    
    // Verificar resultado final
    const itensFinal = cardapioService.getItems();
    const mapeamentosFinal = cardapioService.getMappings();
    
    console.log(`\n📊 Estatísticas finais:`);
    console.log(`- Itens no SQLite: ${itensFinal.length}`);
    console.log(`- Mapeamentos criados: ${Object.keys(mapeamentosFinal).length}`);
    
    // Testar alguns mapeamentos de adicionais
    console.log(`\n🔍 Testando mapeamentos de adicionais:`);
    const testesAdicionais = ['queijo', 'bacon', 'catupiry', 'cheddar'];
    
    testesAdicionais.forEach(teste => {
      const itemId = mapeamentosFinal[teste];
      if (itemId) {
        const item = itensFinal.find(i => i.id === itemId);
        if (item) {
          console.log(`✅ '${teste}' -> ID ${itemId}: ${item.nome} - R$ ${item.preco.toFixed(2)}`);
        }
      } else {
        console.log(`❌ '${teste}' -> Mapeamento não encontrado`);
      }
    });
    
    console.log('\n=== MIGRAÇÃO COMPLETADA ===');
    
  } catch (error) {
    console.error('Erro ao completar migração:', error);
  }
}

completarMigracao();