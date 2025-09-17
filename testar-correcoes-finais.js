const { analisarPalavras, separarMensagem } = require('./src/core/analisePalavras');
const cardapioService = require('./src/services/cardapioService');
const carrinhoService = require('./src/services/carrinhoService');

async function testarCorrecoes() {
    console.log('=== TESTE DAS CORREÇÕES FINAIS ===');
    
    try {
        // Inicializar serviços
        await cardapioService.init();
        console.log('✅ Cardápio inicializado');
        
        // Casos de teste
        const testCases = [
            'coca-cola zero 2 litros',
            'coca cola zero 2 litros', 
            'quero x-egg',
            'x-egg',
            'x egg',
            'coca-cola 2 litros',
            'coca cola 2 litros'
        ];
        
        for (const testCase of testCases) {
            console.log(`\n🧪 Testando: "${testCase}"`);
            
            // Criar cliente único para cada teste
            const clienteId = `teste_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            // Inicializar carrinho
            carrinhoService.initCarrinho(clienteId);
            const carrinho = carrinhoService.getCarrinho(clienteId);
            
            // Separar palavras
            const palavras = separarMensagem(testCase);
            console.log(`   Palavras: [${palavras.join(', ')}]`);
            
            // Mock dos parâmetros
            const mockMsg = {
                from: `${clienteId}@c.us`,
                body: testCase,
                reply: (text) => console.log(`   🤖 Resposta: ${text.substring(0, 100)}...`)
            };
            
            const mockClient = {
                sendMessage: (to, media, options) => {
                    console.log(`   📤 Enviando: ${options ? options.caption || 'Mídia' : 'Mídia'}`);
                }
            };
            
            const mockMessageMedia = {
                fromFilePath: (path) => ({ path })
            };
            
            // Executar análise
            const startTime = Date.now();
            const resultado = await analisarPalavras(palavras, carrinho, mockMsg, clienteId, mockClient, mockMessageMedia);
            const endTime = Date.now();
            
            // Verificar resultado
            const carrinhoFinal = carrinhoService.getCarrinho(clienteId);
            const itensNoCarrinho = carrinhoFinal.carrinho.length;
            
            console.log(`   ⏱️ Tempo: ${endTime - startTime}ms`);
            console.log(`   📦 Itens adicionados: ${itensNoCarrinho}`);
            
            if (itensNoCarrinho > 0) {
                carrinhoFinal.carrinho.forEach(item => {
                    console.log(`   ✅ ${item.nome} - R$ ${item.preco} (Qtd: ${item.quantidade})`);
                });
            } else {
                console.log(`   ❌ Nenhum item foi adicionado`);
            }
            
            // Limpar carrinho para próximo teste
            carrinhoService.resetCarrinho(clienteId);
        }
        
        console.log('\n🎉 Teste das correções concluído!');
        
    } catch (error) {
        console.error('❌ Erro durante o teste:', error);
        console.error('Stack trace:', error.stack);
    }
}

testarCorrecoes().then(() => {
    console.log('\n✅ Todos os testes finalizados');
    process.exit(0);
}).catch(error => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
});