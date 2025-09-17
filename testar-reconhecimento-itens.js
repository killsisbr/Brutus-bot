const analisePalavras = require('./src/core/analisePalavras');
const carrinhoService = require('./src/services/carrinhoService');
const cardapioService = require('./src/services/cardapioService');

async function testarReconhecimentoItens() {
    console.log('🔍 Testando reconhecimento de itens do cardápio...');
    
    // Inicializar serviços
    await cardapioService.init();
    
    // Obter mapeamentos do banco de dados
    const mappings = cardapioService.getMappings();
    console.log('\n📋 Mapeamentos disponíveis no banco:');
    Object.entries(mappings).forEach(([nome, id]) => {
        console.log(`  "${nome}" -> ID ${id}`);
    });
    
    // Obter itens do cardápio
    const items = cardapioService.getItems();
    console.log('\n🍔 Itens do cardápio:');
    items.forEach(item => {
        console.log(`  ID ${item.id}: ${item.nome} - R$ ${item.preco} (${item.tipo})`);
    });
    
    // Testar reconhecimento dos itens 'aaa' e 'xx'
    console.log('\n🤖 Testando reconhecimento pelo robô:');
    
    const testCases = ['aaa', 'xx', 'xxxx', '2 aaa', 'quero um xx'];
    
    for (const testCase of testCases) {
        console.log(`\n📝 Testando: "${testCase}"`);
        
        // Separar mensagem em palavras
        const palavras = analisePalavras.separarMensagem(testCase);
        console.log(`   Palavras: [${palavras.join(', ')}]`);
        
        // Testar getItemIdByName (agora assíncrono)
        const itemId = await analisePalavras.getItemIdByName(testCase);
        console.log(`   getItemIdByName resultado: ${itemId}`);
        
        // Testar parseItemInput
        const parsed = analisePalavras.parseItemInput(testCase);
        console.log(`   parseItemInput resultado:`, parsed);
        
        // Simular carrinho para teste
        const carrinhoTeste = {
            carrinho: [],
            estado: 'menu_inicial',
            valorTotal: 0
        };
        
        // Simular ID do cliente
        const clienteIdTeste = '5511999999999';
        
        try {
            // Testar análise de palavras completa
            console.log(`   Simulando análise completa...`);
            analisePalavras.analisarPalavras(palavras, carrinhoTeste, 
                { body: testCase }, clienteIdTeste);
            
            if (carrinhoTeste.carrinho.length > 0) {
                console.log(`   ✅ Item adicionado ao carrinho:`);
                carrinhoTeste.carrinho.forEach(item => {
                    console.log(`      - ${item.nome} (ID: ${item.id}) x${item.quantidade} - R$ ${item.preco}`);
                });
            } else {
                console.log(`   ❌ Nenhum item foi adicionado ao carrinho`);
            }
        } catch (error) {
            console.log(`   ⚠️  Erro na análise: ${error.message}`);
        }
    }
    
    console.log('\n🎯 Teste concluído!');
}

// Executar teste
testarReconhecimentoItens().catch(console.error);