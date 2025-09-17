const cardapioService = require('./src/services/cardapioService');

async function verificarFlash() {
    console.log('🔍 Verificando mapeamento para "flash"...');
    
    // Inicializar serviço
    await cardapioService.init();
    
    // Listar TODOS os itens para encontrar ID 111
    console.log('\n🍔 Todos os itens do cardápio:');
    const items = cardapioService.getItems();
    items.forEach(item => {
        console.log(`  ID ${item.id}: ${item.nome} - R$ ${item.preco} (${item.tipo})`);
    });
    
    // Verificar especificamente ID 111
    const item111 = items.find(i => i.id === 111);
    if (item111) {
        console.log(`\n✅ Item ID 111 encontrado: ${item111.nome}`);
    } else {
        console.log('\n❌ Item ID 111 NÃO encontrado');
        
        // Vamos criar um item "flash" se não existir
        console.log('\n🔧 Criando item "flash"...');
        const novoId = cardapioService.addItem({
            nome: 'Flash',
            descricao: 'Lanche especial',
            preco: 23.00,
            tipo: 'Lanche'
        });
        
        if (novoId) {
            console.log(`✅ Item "Flash" criado com ID: ${novoId}`);
            
            // Criar mapeamento
            cardapioService.addMapping('flash', novoId);
            console.log(`✅ Mapeamento "flash" -> ID ${novoId} criado`);
        }
    }
    
    // Verificar mapeamentos atuais
    console.log('\n📋 Verificando se "flash" está mapeado:');
    const mappings = cardapioService.getMappings();
    
    if (mappings['flash']) {
        console.log(`✅ "flash" está mapeado para ID: ${mappings['flash']}`);
        
        // Verificar se o item existe
        const item = items.find(i => i.id === mappings['flash']) || 
                    cardapioService.getItems().find(i => i.id === mappings['flash']);
        
        if (item) {
            console.log(`✅ Item encontrado: ${item.nome} - R$ ${item.preco} (${item.tipo})`);
        } else {
            console.log(`❌ PROBLEMA: Mapeamento aponta para ID ${mappings['flash']}, mas item não existe!`);
        }
    } else {
        console.log('❌ "flash" NÃO está mapeado');
        
        // Se existe item ID 111, criar mapeamento
        if (item111) {
            console.log(`\n🔧 Criando mapeamento "flash" -> ID 111 (${item111.nome})`);
            cardapioService.addMapping('flash', 111);
            console.log('✅ Mapeamento criado com sucesso!');
        }
    }
}

verificarFlash().catch(console.error);