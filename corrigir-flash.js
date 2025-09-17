const cardapioService = require('./src/services/cardapioService');

async function corrigirFlash() {
    console.log('🔧 Corrigindo item Flash...');
    
    // Inicializar serviço
    await cardapioService.init();
    
    // Verificar item ID 32
    const items = cardapioService.getItems();
    const item32 = items.find(i => i.id === 32);
    
    if (item32) {
        console.log('Item ID 32 atual:', JSON.stringify(item32, null, 2));
        
        // Atualizar o item para ter o nome correto
        console.log('\n🔄 Atualizando item...');
        
        // Remover o item atual
        cardapioService.removeItem(32);
        console.log('✅ Item ID 32 removido');
        
        // Adicionar novamente com nome correto
        const novoId = cardapioService.addItem({
            nome: 'Flash',
            descricao: 'Lanche especial',
            preco: 23.00,
            tipo: 'Lanche'
        });
        
        console.log(`✅ Novo item criado com ID: ${novoId}`);
        
        // Atualizar mapeamento se necessário
        const mappings = cardapioService.getMappings();
        if (mappings['flash'] === 32 && novoId !== 32) {
            cardapioService.removeMapping('flash');
            cardapioService.addMapping('flash', novoId);
            console.log(`✅ Mapeamento atualizado: flash -> ${novoId}`);
        }
        
        // Verificar resultado final
        const itemsAtualizados = cardapioService.getItems();
        const itemFlash = itemsAtualizados.find(i => i.nome === 'Flash');
        console.log('\n📋 Item Flash final:', JSON.stringify(itemFlash, null, 2));
        
        const mappingsAtualizados = cardapioService.getMappings();
        console.log('Mapeamento flash:', mappingsAtualizados['flash']);
        
    } else {
        console.log('❌ Item ID 32 não encontrado');
    }
}

corrigirFlash().catch(console.error);