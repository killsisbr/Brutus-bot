const { analisarPalavras } = require('./src/core/analisePalavras');
const cardapioService = require('./src/services/cardapioService');
const carrinhoService = require('./src/services/carrinhoService');

async function testarXEgg() {
    console.log('=== TESTE X-EGG ===');
    
    try {
        // Inicializar serviços
        await cardapioService.init();
        console.log('✅ Cardápio inicializado');
        
        // Criar carrinho mock
        const clienteId = 'teste123';
        const carrinho = {
            clienteId,
            itens: [],
            total: 0,
            status: 'menu-inicial'
        };
        
        // Testar mensagem
        const mensagem = {
            body: 'quero x-egg',
            from: clienteId
        };
        
        console.log('\n🔍 Testando mensagem:', mensagem.body);
        console.log('Palavras separadas:', mensagem.body.toLowerCase().split(/\s+/));
        
        // Verificar se x-egg existe no banco
        const mapeamentos = cardapioService.getMappings();
        console.log('\n📊 Total de mapeamentos:', Object.keys(mapeamentos).length);
        
        const xEggMapeamentos = Object.entries(mapeamentos).filter(([palavra, itemId]) => 
            palavra.includes('x-egg') || 
            palavra.includes('x egg') ||
            palavra.includes('xegg') ||
            palavra.includes('x egg')
        );
        
        console.log('\n🔍 Mapeamentos relacionados ao X-EGG:');
        xEggMapeamentos.forEach(([palavra, itemId]) => {
            console.log(`  - "${palavra}" -> Item ID: ${itemId}`);
        });
        
        // Separar palavras da mensagem
        const { separarMensagem } = require('./src/core/analisePalavras');
        const palavras = separarMensagem(mensagem.body);
        console.log('\n📝 Palavras separadas:', palavras);
        
        // Testar análise
        console.log('\n⚡ Iniciando análise...');
        const startTime = Date.now();
        
        // Mock dos parâmetros necessários
        const mockMsg = {
            from: mensagem.from,
            body: mensagem.body,
            reply: (text) => console.log('🤖 BOT RESPOSTA:', text)
        };
        
        const mockClient = {
            sendMessage: (to, media, options) => {
                console.log('📤 BOT ENVIANDO:', options ? options.caption || 'Mídia' : 'Mídia');
            }
        };
        
        const mockMessageMedia = {
            fromFilePath: (path) => ({ path })
        };
        
        const resultado = await analisarPalavras(palavras, carrinho, mockMsg, clienteId, mockClient, mockMessageMedia);
        
        const endTime = Date.now();
        console.log(`\n⏱️ Tempo de processamento: ${endTime - startTime}ms`);
        
        console.log('\n📋 Resultado da análise:');
        console.log('- Lanches processados:', resultado || 'nenhum');
        console.log('- Carrinho após análise:', JSON.stringify(carrinho, null, 2));
        
        // Verificar carrinho do serviço
        const carrinhoServico = carrinhoService.getCarrinho(clienteId);
        console.log('\n🛒 Carrinho do serviço:', JSON.stringify(carrinhoServico, null, 2));
        
    } catch (error) {
        console.error('❌ Erro durante o teste:', error);
        console.error('Stack trace:', error.stack);
    }
}

testarXEgg().then(() => {
    console.log('\n✅ Teste concluído');
    process.exit(0);
}).catch(error => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
});