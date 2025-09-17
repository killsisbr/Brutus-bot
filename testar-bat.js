const cardapioService = require('./src/services/cardapioService');
const analisePalavras = require('./src/core/analisePalavras');
const carrinhoService = require('./src/services/carrinhoService');

async function testarBat() {
    console.log('🧪 Testando reconhecimento de "bat"...');
    
    await cardapioService.init();
    
    // Testar reconhecimento
    console.log('\n📝 Testando mensagem: "bat"');
    const palavras = ['bat'];
    console.log('Palavras:', palavras);
    
    // Verificar mapeamento
    const mappings = cardapioService.getMappings();
    console.log('Mapeamento "bat":', mappings['bat']);
    
    // Testar getItemIdByName
    const itemId = await analisePalavras.getItemIdByName('bat');
    console.log('ID encontrado:', itemId);
    
    // Verificar se item existe
    const items = cardapioService.getItems();
    const item = items.find(i => i.id === itemId);
    console.log('Item encontrado:', item);
    
    // Testar adição ao carrinho
    const clienteId = '554191798537';
    console.log('\n🔄 Testando adição ao carrinho...');
    
    try {
        const resultado = await carrinhoService.adicionarItemAoCarrinho(
            clienteId,
            itemId,
            1,
            '',
            'normal'
        );
        
        console.log('✅ Item adicionado com sucesso!');
        console.log('Resultado:', resultado);
        
        // Verificar carrinho
        const carrinho = carrinhoService.obterCarrinho(clienteId);
        console.log('\n📊 Estado do carrinho:');
        console.log('Itens:', carrinho.itens.length);
        console.log('Total:', carrinho.total);
        
        if (carrinho.itens.length > 0) {
            console.log('Último item:', carrinho.itens[carrinho.itens.length - 1]);
        }
        
    } catch (error) {
        console.log('❌ Erro ao adicionar item:', error.message);
    }
}

testarBat().catch(console.error);