const cardapioService = require('./src/services/cardapioService');

async function corrigirBat() {
    console.log('🔧 Corrigindo mapeamento "bat"...');
    
    await cardapioService.init();
    
    // Verificar estado atual
    const mappings = cardapioService.getMappings();
    console.log('Mapeamento atual "bat":', mappings['bat']);
    
    // Verificar itens de batata disponíveis
    const items = cardapioService.getItems();
    const batataItems = items.filter(i => 
        i.nome && i.nome.toLowerCase().includes('batata')
    );
    
    console.log('\nItens de batata disponíveis:');
    batataItems.forEach(item => {
        console.log(`ID ${item.id}: ${item.nome} - R$ ${item.preco}`);
    });
    
    // Escolher Batata Palito como padrão (mais comum)
    const batataEscolhida = batataItems.find(i => i.nome.includes('Palito')) || batataItems[0];
    
    if (batataEscolhida) {
        console.log(`\n✅ Escolhendo: ${batataEscolhida.nome} (ID ${batataEscolhida.id})`);
        
        // Remover mapeamento antigo
        cardapioService.removeMapping('bat');
        
        // Criar novo mapeamento
        cardapioService.addMapping('bat', batataEscolhida.id);
        
        console.log(`✅ Mapeamento atualizado: bat -> ${batataEscolhida.id}`);
        
        // Verificar resultado
        const mappingsAtualizados = cardapioService.getMappings();
        console.log('Novo mapeamento "bat":', mappingsAtualizados['bat']);
        
        // Testar item
        const itemTeste = items.find(i => i.id === batataEscolhida.id);
        console.log('Item encontrado:', itemTeste);
        
    } else {
        console.log('❌ Nenhum item de batata encontrado!');
    }
}

corrigirBat().catch(console.error);