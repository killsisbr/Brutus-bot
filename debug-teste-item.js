const cardapioService = require('./src/services/cardapioService');
const analisePalavras = require('./src/core/analisePalavras');

async function debugTesteItem() {
    console.log('🔍 Debugando item "teste"...');
    
    try {
        // Inicializar serviço
        await cardapioService.init();
        
        // 1. Verificar se o item existe no banco
        console.log('\n1. Verificando itens no banco...');
        const items = cardapioService.getItems();
        const itemTeste = items.find(item => item.nome.toLowerCase().includes('teste'));
        
        if (itemTeste) {
            console.log('✅ Item encontrado:', itemTeste);
        } else {
            console.log('❌ Item "teste" não encontrado no banco');
            console.log('Itens disponíveis:');
            items.forEach(item => {
                console.log(`  - ID ${item.id}: ${item.nome} (${item.tipo})`);
            });
            return;
        }
        
        // 2. Verificar mapeamentos
        console.log('\n2. Verificando mapeamentos...');
        const mappings = cardapioService.getMappings();
        console.log('Mapeamentos disponíveis:');
        Object.entries(mappings).forEach(([palavra, itemId]) => {
            console.log(`  "${palavra}" -> ID ${itemId}`);
        });
        
        // Verificar se existe mapeamento para "teste"
        const testeMapping = mappings['teste'];
        if (testeMapping) {
            console.log(`✅ Mapeamento encontrado: "teste" -> ID ${testeMapping}`);
            if (testeMapping === itemTeste.id) {
                console.log('✅ Mapeamento correto!');
            } else {
                console.log(`❌ Mapeamento incorreto! Esperado ID ${itemTeste.id}, encontrado ID ${testeMapping}`);
            }
        } else {
            console.log('❌ Mapeamento "teste" não encontrado');
        }
        
        // 3. Testar reconhecimento via getItemIdByName
        console.log('\n3. Testando reconhecimento...');
        const itemId = await analisePalavras.getItemIdByName('teste');
        console.log(`getItemIdByName('teste') retornou: ${itemId}`);
        
        if (itemId === itemTeste.id) {
            console.log('✅ Reconhecimento funcionando!');
        } else {
            console.log(`❌ Reconhecimento falhou! Esperado ID ${itemTeste.id}, retornou ${itemId}`);
        }
        
        // 4. Testar variações
        console.log('\n4. Testando variações...');
        const variacoes = ['teste', 'x teste', 'quero teste', 'TESTE', 'Teste'];
        
        for (const variacao of variacoes) {
            const id = await analisePalavras.getItemIdByName(variacao);
            console.log(`"${variacao}" -> ID ${id} ${id === itemTeste.id ? '✅' : '❌'}`);
        }
        
        // 5. Verificar se há gatilhos adicionais
        console.log('\n5. Verificando gatilhos do item...');
        const gatilhosDoItem = cardapioService.getMappingsByItemId(itemTeste.id);
        console.log('Gatilhos encontrados:', gatilhosDoItem);
        
    } catch (error) {
        console.error('❌ Erro durante o debug:', error);
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    debugTesteItem();
}

module.exports = { debugTesteItem };