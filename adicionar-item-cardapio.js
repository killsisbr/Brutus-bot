const cardapioService = require('./src/services/cardapioService');

async function corrigirItem() {
    console.log('\n=== CORRIGINDO ITEM NO CARDÁPIO ===\n');
    
    // Inicializar serviço
    await cardapioService.init();
    
    // Listar itens atuais
    console.log('Itens atuais no cardápio:');
    const items = cardapioService.getItems();
    items.forEach(item => {
        console.log(`  ID ${item.id}: ${item.nome} - R$ ${item.preco} (${item.tipo})`);
    });
    
    // Verificar se existe item com nome similar
    const itemExistente = items.find(item => item.nome.includes('AAA') || item.nome.includes('XX'));
    
    if (itemExistente) {
        console.log('\nRemovendo item existente:', itemExistente);
        cardapioService.removeItem(itemExistente.id);
    }
    
    // Verificar mapeamentos
    console.log('\nMapeamentos atuais:');
    const mappings = cardapioService.getMappings();
    for (const [nome, id] of Object.entries(mappings)) {
        console.log(`  "${nome}" -> ID ${id}`);
    }
    
    // Como o addItem não aceita ID customizado, vamos:
    // 1. Adicionar o item (vai gerar um novo ID)
    // 2. Atualizar os mapeamentos para apontar para o novo ID
    
    const novoItem = {
        nome: 'Lanche Especial AAA/XX',
        descricao: 'Lanche especial com ingredientes selecionados',
        preco: 25.00,
        tipo: 'Lanche'
    };
    
    console.log('\nAdicionando novo item:', novoItem);
    const novoId = cardapioService.addItem(novoItem);
    
    if (novoId) {
        console.log(`✅ Item adicionado com ID: ${novoId}`);
        
        // Atualizar mapeamentos para apontar para o novo ID
        console.log('\nAtualizando mapeamentos...');
        cardapioService.addMapping('aaa', novoId);
        cardapioService.addMapping('xx', novoId);
        cardapioService.addMapping('xxxx', novoId);
        
        // Verificar resultado final
        console.log('\nItens finais no cardápio:');
        const itemsFinais = cardapioService.getItems();
        itemsFinais.forEach(item => {
            console.log(`  ID ${item.id}: ${item.nome} - R$ ${item.preco} (${item.tipo})`);
        });
        
        console.log('\nMapeamentos finais:');
        const mappingsFinais = cardapioService.getMappings();
        for (const [nome, id] of Object.entries(mappingsFinais)) {
            if (['aaa', 'xx', 'xxxx'].includes(nome)) {
                console.log(`  "${nome}" -> ID ${id}`);
            }
        }
    } else {
        console.log('❌ Erro ao adicionar item');
    }
}

corrigirItem().catch(console.error);