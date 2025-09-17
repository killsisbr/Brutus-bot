const analisePalavras = require('./src/core/analisePalavras');
const carrinhoService = require('./src/services/carrinhoService');
const cardapioService = require('./src/services/cardapioService');

async function testarFlash() {
    console.log('🧪 Testando reconhecimento de "flash"...');
    
    // Inicializar serviços
    await cardapioService.init();
    
    // Simular carrinho para teste
    const clienteIdTeste = '554191798537';
    const carrinhoTeste = {
        carrinho: [],
        estado: 'menu_inicial',
        valorTotal: 0,
        aprt: false,
        alertAdicionado: false
    };
    
    // Simular mensagem
    const msgTeste = {
        body: 'flash',
        reply: (texto) => console.log('📱 Resposta:', texto)
    };
    
    console.log('\n📝 Testando mensagem: "flash"');
    
    // Separar em palavras
    const palavras = analisePalavras.separarMensagem('flash');
    console.log('Palavras:', palavras);
    
    // Verificar mapeamento
    const mappings = cardapioService.getMappings();
    console.log('Mapeamento "flash":', mappings['flash']);
    
    // Testar getItemIdByName
    const itemId = await analisePalavras.getItemIdByName('flash');
    console.log('ID encontrado:', itemId);
    
    // Testar análise completa
    console.log('\n🔄 Executando análise completa...');
    try {
        const resultado = await analisePalavras.analisarPalavras(
            palavras, 
            carrinhoTeste, 
            msgTeste, 
            clienteIdTeste
        );
        
        console.log('\n📊 Resultado da análise:');
        console.log('- Carrinho após análise:', carrinhoTeste.carrinho.length, 'itens');
        console.log('- Estado aprt:', carrinhoTeste.aprt);
        console.log('- Alert adicionado:', carrinhoTeste.alertAdicionado);
        
        if (carrinhoTeste.carrinho.length > 0) {
            console.log('\n✅ Itens no carrinho:');
            carrinhoTeste.carrinho.forEach((item, index) => {
                console.log(`  ${index + 1}. ${item.nome} (ID: ${item.id}) x${item.quantidade} - R$ ${item.preco}`);
            });
        } else {
            console.log('\n❌ Nenhum item foi adicionado ao carrinho');
        }
        
    } catch (error) {
        console.error('❌ Erro na análise:', error);
    }
}

testarFlash().catch(console.error);