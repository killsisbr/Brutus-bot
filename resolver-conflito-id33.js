const cardapioService = require('./src/services/cardapioService');
const cardapioEstatico = require('./src/utils/cardapio');

async function resolverConflito() {
    console.log('🔧 Resolvendo conflito definitivamente...');
    
    // Inicializar serviço
    await cardapioService.init();
    
    // IDs ocupados no cardápio estático
    const idsEstaticos = cardapioEstatico.map(i => i.id);
    console.log('IDs estáticos ocupados:', idsEstaticos.sort((a,b) => a-b));
    
    // Verificar se Flash existe e em qual ID
    const itemsDinamicos = cardapioService.getItems();
    const itemFlash = itemsDinamicos.find(i => i.nome === 'Flash');
    
    if (itemFlash) {
        console.log('Flash encontrado no ID:', itemFlash.id);
        
        // Verificar se há conflito com cardápio estático
        const conflito = idsEstaticos.includes(itemFlash.id);
        
        if (conflito) {
            console.log('⚠️ CONFLITO! Flash está no ID', itemFlash.id, 'que é usado pelo cardápio estático');
            
            // Usar ID 100 que está livre
            const novoId = 100;
            console.log(`🔄 Movendo Flash para ID ${novoId}...`);
            
            // Remover item atual
            cardapioService.removeItem(itemFlash.id);
            console.log('✅ Flash removido do ID', itemFlash.id);
            
            // Adicionar com novo ID
            const flashId = cardapioService.addItem({
                nome: 'Flash',
                descricao: 'Lanche especial',
                preco: 23.00,
                tipo: 'Lanche'
            });
            
            console.log(`✅ Flash recriado com ID: ${flashId}`);
            
            // Atualizar mapeamento
            cardapioService.removeMapping('flash');
            cardapioService.addMapping('flash', flashId);
            console.log(`✅ Mapeamento atualizado: flash -> ${flashId}`);
            
        } else {
            console.log('✅ Nenhum conflito detectado para Flash');
        }
    } else {
        console.log('❌ Flash não encontrado, criando...');
        
        const flashId = cardapioService.addItem({
            nome: 'Flash',
            descricao: 'Lanche especial',
            preco: 23.00,
            tipo: 'Lanche'
        });
        
        cardapioService.addMapping('flash', flashId);
        console.log(`✅ Flash criado com ID: ${flashId}`);
    }
    
    // Verificar resultado final
    const mappings = cardapioService.getMappings();
    const itemsFinais = cardapioService.getItems();
    const flashFinal = itemsFinais.find(i => i.nome === 'Flash');
    
    console.log('\n📋 Resultado final:');
    console.log('Mapeamento flash:', mappings['flash']);
    console.log('Item Flash:', flashFinal);
}

resolverConflito().catch(console.error);