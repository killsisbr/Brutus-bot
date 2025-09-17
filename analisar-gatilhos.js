const cardapioService = require('./src/services/cardapioService');

async function analisarGatilhos() {
    try {
        console.log('🔍 ANÁLISE DOS GATILHOS DO CARDÁPIO');
        console.log('='.repeat(50));
        
        // Inicializar o serviço
        await cardapioService.init();
        console.log('✅ CardapioService inicializado');
        
        // Obter dados
        const items = cardapioService.getItems();
        const mappings = cardapioService.getMappings();
        
        console.log(`\n🍔 ITENS DO CARDÁPIO (${items.length} total):`);
        console.log('='.repeat(50));
        
        let comGatilhos = 0;
        let semGatilhos = 0;
        const todosGatilhos = new Set();
        
        // Criar mapa reverso de mappings (gatilho -> itemId)
        const gatilhosPorItem = {};
        Object.entries(mappings).forEach(([gatilho, itemId]) => {
            if (!gatilhosPorItem[itemId]) {
                gatilhosPorItem[itemId] = [];
            }
            gatilhosPorItem[itemId].push(gatilho);
            todosGatilhos.add(gatilho);
        });
        
        items.forEach((item, index) => {
            const gatilhosDoItem = gatilhosPorItem[item.id] || [];
            const temGatilhos = gatilhosDoItem.length > 0;
            
            if (temGatilhos) comGatilhos++;
            else semGatilhos++;
            
            console.log(`\n${index + 1}. ${item.nome}`);
            console.log(`   ID: ${item.id} | Tipo: ${item.tipo} | Preço: R$ ${item.preco}`);
            
            if (temGatilhos) {
                console.log(`   🎯 Gatilhos (${gatilhosDoItem.length}): ${gatilhosDoItem.join(', ')}`);
            } else {
                console.log(`   ⚪ Sem gatilhos configurados`);
            }
        });
        
        console.log('\n📊 RESUMO:');
        console.log('='.repeat(30));
        console.log(`Total de itens: ${items.length}`);
        console.log(`Com gatilhos: ${comGatilhos}`);
        console.log(`Sem gatilhos: ${semGatilhos}`);
        console.log(`Percentual com gatilhos: ${((comGatilhos / items.length) * 100).toFixed(1)}%`);
        
        console.log(`\n🎯 GATILHOS ÚNICOS (${todosGatilhos.size} total):`);
        console.log('='.repeat(40));
        Array.from(todosGatilhos).sort().forEach((gatilho, index) => {
            const itemId = mappings[gatilho];
            const item = items.find(i => i.id === itemId);
            console.log(`${index + 1}. "${gatilho}" -> ${item ? item.nome : 'Item não encontrado'} (ID: ${itemId})`);
        });
        
        console.log('\n🔧 ANÁLISE DETALHADA POR TIPO:');
        console.log('='.repeat(40));
        const itensPorTipo = {};
        items.forEach(item => {
            if (!itensPorTipo[item.tipo]) {
                itensPorTipo[item.tipo] = { total: 0, comGatilhos: 0 };
            }
            itensPorTipo[item.tipo].total++;
            if (gatilhosPorItem[item.id] && gatilhosPorItem[item.id].length > 0) {
                itensPorTipo[item.tipo].comGatilhos++;
            }
        });
        
        Object.entries(itensPorTipo).forEach(([tipo, stats]) => {
            const percentual = ((stats.comGatilhos / stats.total) * 100).toFixed(1);
            console.log(`${tipo}: ${stats.comGatilhos}/${stats.total} (${percentual}%) com gatilhos`);
        });
        
    } catch (error) {
        console.error('❌ Erro na análise:', error);
    }
}

analisarGatilhos();