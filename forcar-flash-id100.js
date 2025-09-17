const cardapioService = require('./src/services/cardapioService');

async function forcarFlashId100() {
    console.log('🔧 Forçando Flash para ID 100...');
    
    // Inicializar serviço
    await cardapioService.init();
    
    // Remover qualquer Flash existente
    const items = cardapioService.getItems();
    const flashItems = items.filter(i => i.nome === 'Flash');
    
    for (const flash of flashItems) {
        console.log(`Removendo Flash do ID ${flash.id}`);
        cardapioService.removeItem(flash.id);
    }
    
    // Remover mapeamento existente
    cardapioService.removeMapping('flash');
    
    // Verificar se ID 100 está livre
    const item100 = items.find(i => i.id === 100);
    if (item100) {
        console.log('ID 100 ocupado por:', item100.nome);
        cardapioService.removeItem(100);
    }
    
    // Forçar criação no ID 100
    console.log('Criando Flash no ID 100...');
    
    // Usar método direto do SQLite para forçar ID específico
    const db = cardapioService.db;
    if (db) {
        try {
            db.exec(`INSERT INTO items (id, nome, descricao, preco, tipo) VALUES (100, 'Flash', 'Lanche especial', 23.0, 'Lanche')`);
            console.log('✅ Flash criado diretamente no ID 100');
            
            // Criar mapeamento
            cardapioService.addMapping('flash', 100);
            console.log('✅ Mapeamento criado: flash -> 100');
            
        } catch (e) {
            console.error('Erro ao criar Flash no ID 100:', e);
        }
    }
    
    // Verificar resultado
    const itemsFinais = cardapioService.getItems();
    const flashFinal = itemsFinais.find(i => i.id === 100);
    const mappings = cardapioService.getMappings();
    
    console.log('\n📋 Resultado final:');
    console.log('Item ID 100:', flashFinal);
    console.log('Mapeamento flash:', mappings['flash']);
}

forcarFlashId100().catch(console.error);