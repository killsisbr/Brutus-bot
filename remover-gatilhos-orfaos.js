const cardapioService = require('./src/services/cardapioService');

async function removerGatilhosOrfaos() {
    try {
        console.log('🧹 REMOVENDO GATILHOS ÓRFÃOS');
        console.log('='.repeat(50));
        
        // Inicializar o serviço
        await cardapioService.init();
        console.log('✅ CardapioService inicializado');
        
        // IDs órfãos identificados na análise
        const idsOrfaos = [18, 19, 54, 72, 74, 75, 76, 78];
        
        // Obter dados atuais
        const items = cardapioService.getItems();
        const mappings = cardapioService.getMappings();
        
        console.log(`\n📊 Estado atual:`);
        console.log(`- Total de itens: ${items.length}`);
        console.log(`- Total de gatilhos: ${Object.keys(mappings).length}`);
        
        // Verificar quais IDs realmente existem
        const idsExistentes = new Set(items.map(item => item.id));
        console.log(`\n🔍 Verificando IDs órfãos:`);
        
        let gatilhosRemovidos = 0;
        let gatilhosOrfaosEncontrados = [];
        
        // Encontrar gatilhos que apontam para IDs órfãos
        Object.entries(mappings).forEach(([gatilho, itemId]) => {
            if (idsOrfaos.includes(itemId) || !idsExistentes.has(itemId)) {
                gatilhosOrfaosEncontrados.push({ gatilho, itemId });
            }
        });
        
        console.log(`\n🎯 Gatilhos órfãos encontrados: ${gatilhosOrfaosEncontrados.length}`);
        
        if (gatilhosOrfaosEncontrados.length === 0) {
            console.log('✅ Nenhum gatilho órfão encontrado!');
            return;
        }
        
        // Listar gatilhos órfãos antes de remover
        console.log('\n📋 Lista de gatilhos órfãos:');
        gatilhosOrfaosEncontrados.forEach((item, index) => {
            console.log(`${index + 1}. "${item.gatilho}" -> ID ${item.itemId} (não existe)`);
        });
        
        console.log('\n🗑️ Removendo gatilhos órfãos...');
        
        // Remover cada gatilho órfão
        for (const { gatilho, itemId } of gatilhosOrfaosEncontrados) {
            const sucesso = cardapioService.removeMapping(gatilho);
            if (sucesso) {
                gatilhosRemovidos++;
                console.log(`✅ Removido: "${gatilho}" (ID ${itemId})`);
            } else {
                console.log(`❌ Erro ao remover: "${gatilho}" (ID ${itemId})`);
            }
        }
        
        console.log('\n📊 RESULTADO FINAL:');
        console.log('='.repeat(30));
        console.log(`Gatilhos órfãos removidos: ${gatilhosRemovidos}`);
        console.log(`Gatilhos restantes: ${Object.keys(cardapioService.getMappings()).length}`);
        
        if (gatilhosRemovidos > 0) {
            console.log('\n✅ Limpeza concluída com sucesso!');
            console.log('💡 Recomendação: Execute novamente a análise para verificar o resultado.');
        }
        
    } catch (error) {
        console.error('❌ Erro na remoção:', error);
    }
}

removerGatilhosOrfaos();