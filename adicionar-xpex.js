const cardapioService = require('./src/services/cardapioService');

async function adicionarXpex() {
  try {
    console.log('=== ADICIONANDO MAPEAMENTO XPEX ===');
    
    // Inicializar o serviço
    await cardapioService.init();
    console.log('✅ CardapioService inicializado');
    
    // Buscar todos os itens
    const itens = cardapioService.getItems();
    console.log(`📋 Total de itens no cardápio: ${itens.length}`);
    
    // Procurar por itens que podem ser o 'xpex'
    console.log('\n🔍 Procurando possíveis candidatos para "xpex":');
    
    // Candidatos mais prováveis baseados no nome
    const candidatos = [
      // Itens com 'X' no nome
      ...itens.filter(item => item.nome && item.nome.toLowerCase().includes('x')),
      // Itens que podem ser lanches especiais
      ...itens.filter(item => item.nome && (
        item.nome.toLowerCase().includes('especial') ||
        item.nome.toLowerCase().includes('fish') ||
        item.nome.toLowerCase().includes('frango') ||
        item.nome.toLowerCase().includes('peixe')
      ))
    ];
    
    // Remover duplicatas
    const candidatosUnicos = candidatos.filter((item, index, self) => 
      index === self.findIndex(i => i.id === item.id)
    );
    
    console.log('📋 Candidatos encontrados:');
    candidatosUnicos.forEach((item, index) => {
      console.log(`   ${index + 1}. ID: ${item.id}, Nome: "${item.nome}", Tipo: ${item.tipo}, Preço: R$ ${item.preco}`);
    });
    
    // Verificar se existe algum item que já deveria ter o mapeamento 'xpex'
    console.log('\n🔍 Verificando mapeamentos existentes dos candidatos:');
    const mappings = cardapioService.getMappings();
    
    candidatosUnicos.forEach(item => {
      const mapeamentosDoItem = Object.entries(mappings)
        .filter(([key, value]) => value === item.id)
        .map(([key]) => key);
      
      console.log(`   - ${item.nome} (ID ${item.id}): [${mapeamentosDoItem.join(', ')}]`);
    });
    
    // Sugestões baseadas em análise
    console.log('\n💡 ANÁLISE E SUGESTÕES:');
    
    // Verificar se existe X-Fish ou similar
    const xFish = itens.find(item => 
      item.nome && (
        item.nome.toLowerCase().includes('fish') ||
        item.nome.toLowerCase().includes('peixe')
      )
    );
    
    if (xFish) {
      console.log(`✅ Encontrado item relacionado a peixe: "${xFish.nome}" (ID: ${xFish.id})`);
      console.log('   → Este pode ser o item que deveria ter o mapeamento "xpex"');
    }
    
    // Verificar se existe algum X-Frango que possa ser confundido
    const xFrango = itens.filter(item => 
      item.nome && item.nome.toLowerCase().includes('frango')
    );
    
    if (xFrango.length > 0) {
      console.log(`\n🐔 Itens de frango encontrados:`);
      xFrango.forEach(item => {
        console.log(`   - "${item.nome}" (ID: ${item.id})`);
      });
      console.log('   → Algum destes pode ser confundido com "xpex"?');
    }
    
    // Verificar se existe algum item especial
    const especiais = itens.filter(item => 
      item.nome && (
        item.nome.toLowerCase().includes('especial') ||
        item.nome.toLowerCase().includes('premium') ||
        item.nome.toLowerCase().includes('gourmet')
      )
    );
    
    if (especiais.length > 0) {
      console.log(`\n⭐ Itens especiais encontrados:`);
      especiais.forEach(item => {
        console.log(`   - "${item.nome}" (ID: ${item.id})`);
      });
    }
    
    console.log('\n=== PRÓXIMOS PASSOS ===');
    console.log('\n1. 🔍 IDENTIFICAR O ITEM CORRETO:');
    console.log('   - Verificar com o proprietário qual item deveria ser "xpex"');
    console.log('   - Pode ser um apelido ou abreviação de algum item existente');
    console.log('   - Verificar se é um item que foi removido ou renomeado');
    
    console.log('\n2. 🔧 ADICIONAR O MAPEAMENTO:');
    console.log('   - Após identificar o item correto, usar:');
    console.log('   - cardapioService.addMapping("xpex", ITEM_ID_CORRETO);');
    
    console.log('\n3. 📝 EXEMPLO DE COMO ADICIONAR:');
    if (candidatosUnicos.length > 0) {
      const exemplo = candidatosUnicos[0];
      console.log(`   // Se "xpex" for o item "${exemplo.nome}":`);
      console.log(`   cardapioService.addMapping("xpex", ${exemplo.id});`);
    }
    
    console.log('\n4. ✅ VERIFICAR APÓS ADICIONAR:');
    console.log('   - Aguardar 30 segundos ou reiniciar o bot');
    console.log('   - Testar enviando "xpex" no WhatsApp');
    
    // Opção automática se houver apenas um candidato óbvio
    if (xFish) {
      console.log('\n🤖 SUGESTÃO AUTOMÁTICA:');
      console.log(`   Baseado na análise, "xpex" provavelmente se refere a "${xFish.nome}"`);
      console.log('   Deseja adicionar este mapeamento automaticamente? (descomente a linha abaixo)');
      console.log(`   // cardapioService.addMapping("xpex", ${xFish.id});`);
      
      // Descomente a linha abaixo para adicionar automaticamente
      // const sucesso = cardapioService.addMapping("xpex", xFish.id);
      // if (sucesso) {
      //   console.log(`✅ Mapeamento "xpex" -> "${xFish.nome}" adicionado com sucesso!`);
      // } else {
      //   console.log(`❌ Erro ao adicionar mapeamento`);
      // }
    }
    
  } catch (error) {
    console.error('❌ Erro ao analisar xpex:', error);
  }
}

adicionarXpex();