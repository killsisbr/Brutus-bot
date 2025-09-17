const { analisarPalavras } = require('./src/core/analisePalavras');
const CardapioService = require('./src/services/cardapioService');

async function testarXpex() {
  try {
    console.log('=== TESTANDO MAPEAMENTO XPEX ===');
    
    // Inicializar o serviço
    console.log('🔧 Inicializando CardapioService...');
    await CardapioService.init();
    
    // Verificar se o mapeamento existe
    const mappings = CardapioService.getMappings();
    console.log('\n📋 Verificando mapeamentos:');
    console.log(`   - xpex: ${mappings['xpex'] || 'NÃO ENCONTRADO'}`);
    console.log(`   - x-pex: ${mappings['x-pex'] || 'NÃO ENCONTRADO'}`);
    console.log(`   - x pex: ${mappings['x pex'] || 'NÃO ENCONTRADO'}`);
    
    if (mappings['xpex']) {
      const items = CardapioService.getItems();
      const item = items.find(item => item.id === mappings['xpex']);
      if (item) {
        console.log(`\n🎯 Item mapeado para 'xpex':`);
        console.log(`   - ID: ${item.id}`);
        console.log(`   - Nome: ${item.nome}`);
        console.log(`   - Preço: R$ ${item.preco}`);
        console.log(`   - Tipo: ${item.tipo}`);
      } else {
        console.log(`\n❌ Item com ID ${mappings['xpex']} não encontrado no cardápio`);
      }
    }
    
    // Testar análise de palavras
    console.log('\n🧪 Testando análise de palavras...');
    
    const testCases = ['xpex', 'x-pex', 'x pex', 'XPEX'];
    
    for (const testCase of testCases) {
      console.log(`\n🔍 Testando: "${testCase}"`);
      
      try {
        const resultado = await analisarPalavras([testCase]);
        
        if (resultado && resultado.length > 0) {
          console.log(`   ✅ Reconhecido como:`);
          resultado.forEach(item => {
            console.log(`      - ${item.nome} (ID: ${item.id}) - R$ ${item.preco}`);
          });
        } else {
          console.log(`   ❌ Não reconhecido`);
        }
      } catch (error) {
        console.log(`   ❌ Erro na análise: ${error.message}`);
      }
    }
    
    // Testar com contexto de cliente
    console.log('\n🤖 Simulando análise completa (como no bot):');
    const clienteId = '554191798537';
    
    try {
      const resultadoCompleto = await analisarPalavras(['xpex'], clienteId);
      
      if (resultadoCompleto && resultadoCompleto.length > 0) {
        console.log(`   ✅ Análise completa bem-sucedida:`);
        resultadoCompleto.forEach(item => {
          console.log(`      - ${item.nome} (ID: ${item.id}) - R$ ${item.preco}`);
        });
      } else {
        console.log(`   ❌ Análise completa falhou`);
      }
    } catch (error) {
      console.log(`   ❌ Erro na análise completa: ${error.message}`);
    }
    
    console.log('\n=== RESULTADO DO TESTE ===');
    
    if (mappings['xpex']) {
      console.log('✅ SUCESSO: Mapeamento "xpex" está funcionando!');
      console.log('💡 O problema de reconhecimento deve estar resolvido.');
      console.log('\n📱 Próximo passo: Testar enviando "xpex" no WhatsApp');
    } else {
      console.log('❌ FALHA: Mapeamento "xpex" não foi encontrado');
      console.log('🔧 Execute novamente: node corrigir-xpex.js');
    }
    
  } catch (error) {
    console.error('❌ Erro ao testar xpex:', error);
  }
}

// Executar o teste
testarXpex();