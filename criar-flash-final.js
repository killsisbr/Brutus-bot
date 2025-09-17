const cardapioService = require('./src/services/cardapioService');
const cardapioEstatico = require('./src/utils/cardapio');

async function criarFlashFinal() {
    console.log('🔧 Criando Flash definitivamente...');
    
    // Inicializar serviço
    await cardapioService.init();
    
    // Limpar qualquer Flash existente
    const items = cardapioService.getItems();
    const flashItems = items.filter(i => i.nome === 'Flash');
    
    for (const flash of flashItems) {
        console.log(`Removendo Flash existente do ID ${flash.id}`);
        cardapioService.removeItem(flash.id);
    }
    
    // Remover mapeamento existente
    cardapioService.removeMapping('flash');
    console.log('✅ Limpeza concluída');
    
    // Criar Flash novo
    console.log('\n🔄 Criando novo Flash...');
    const flashId = cardapioService.addItem({
        nome: 'Flash',
        descricao: 'Lanche especial',
        preco: 23.00,
        tipo: 'Lanche'
    });
    
    console.log(`✅ Flash criado com ID: ${flashId}`);
    
    // Verificar se há conflito com cardápio estático
    const idsEstaticos = cardapioEstatico.map(i => i.id);
    const temConflito = idsEstaticos.includes(flashId);
    
    if (temConflito) {
        console.log(`⚠️ ATENÇÃO: ID ${flashId} conflita com cardápio estático!`);
        const itemEstatico = cardapioEstatico.find(i => i.id === flashId);
        console.log(`Item estático: ${itemEstatico.nome}`);
        console.log('Isso pode causar problemas no reconhecimento.');
    } else {
        console.log(`✅ ID ${flashId} está livre de conflitos`);
    }
    
    // Criar mapeamento
    cardapioService.addMapping('flash', flashId);
    console.log(`✅ Mapeamento criado: flash -> ${flashId}`);
    
    // Verificar resultado final
    const itemsFinais = cardapioService.getItems();
    const flashFinal = itemsFinais.find(i => i.id === flashId);
    const mappings = cardapioService.getMappings();
    
    console.log('\n📋 Resultado final:');
    console.log('Item Flash:', JSON.stringify(flashFinal, null, 2));
    console.log('Mapeamento flash:', mappings['flash']);
    
    // Teste rápido de reconhecimento
    console.log('\n🧪 Teste rápido:');
    const analisePalavras = require('./src/core/analisePalavras');
    const itemIdTeste = await analisePalavras.getItemIdByName('flash');
    console.log('getItemIdByName("flash"):', itemIdTeste);
}

criarFlashFinal().catch(console.error);