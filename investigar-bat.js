const cardapioService = require('./src/services/cardapioService');
const analisePalavras = require('./src/core/analisePalavras');

async function investigarBat() {
    console.log('🔍 Investigando problema com "bat"...');
    
    await cardapioService.init();
    
    // Verificar mapeamento
    const mappings = cardapioService.getMappings();
    console.log('Mapeamento "bat":', mappings['bat']);
    
    // Verificar se item ID 99 existe
    const items = cardapioService.getItems();
    const item99 = items.find(i => i.id === 99);
    console.log('Item ID 99:', item99);
    
    // Procurar itens com "bat" no nome
    const batItems = items.filter(i => i.nome && i.nome.toLowerCase().includes('bat'));
    console.log('Itens com "bat" no nome:', batItems);
    
    // Procurar itens com "batata" no nome
    const batataItems = items.filter(i => i.nome && i.nome.toLowerCase().includes('batata'));
    console.log('Itens com "batata" no nome:', batataItems);
    
    // Listar alguns itens para referência
    console.log('\nPrimeiros 10 itens:');
    items.slice(0, 10).forEach(item => {
        console.log(`ID ${item.id}: ${item.nome}`);
    });
    
    // Verificar se há algum item que deveria ser mapeado para "bat"
    console.log('\nTodos os itens com "bat" ou "batata":');
    const allBatItems = items.filter(i => 
        i.nome && (i.nome.toLowerCase().includes('bat') || i.nome.toLowerCase().includes('batata'))
    );
    allBatItems.forEach(item => {
        console.log(`ID ${item.id}: ${item.nome} - ${item.tipo}`);
    });
}

investigarBat().catch(console.error);