const { normalizarTexto, encontrarMelhorMatch, limparDescricao } = require('../src/utils/normalizarTexto');
const cardapioService = require('../src/services/cardapioService');
const { getItemIdByName } = require('../src/core/analisePalavras');

/**
 * Testes automatizados para validar consistência de mapeamentos e normalização
 */

// Casos de teste para normalização de texto
const testesNormalizacao = [
  { input: 'X-BURGUER', expected: 'x burguer' },
  { input: 'Coca-Cola', expected: 'coca cola' },
  { input: 'BATATA FRITA!!!', expected: 'batata frita' },
  { input: 'Flash   Burguer', expected: 'flash burguer' },
  { input: 'X Mega Bacon', expected: 'x mega bacon' },
  { input: 'Coca Lata 350ml', expected: 'coca lata 350ml' }
];

// Casos de teste para busca de itens
const testesBuscaItens = [
  { input: 'brutus', expectedType: 'number' },
  { input: 'x burguer', expectedType: 'number' },
  { input: 'coca lata', expectedType: 'number' },
  { input: 'batata palito', expectedType: 'number' },
  { input: 'flash', expectedType: 'number' },
  { input: 'item inexistente xyz', expectedType: 'null' }
];

// Casos de teste para limpeza de descrição
const testesLimpezaDescricao = [
  { input: 'Hambúrguer com queijo e bacon', shouldNotContain: ['com', 'e', 'de', 'da', 'do'] },
  { input: 'Batata frita grande com molho', shouldNotContain: ['com', 'grande'] },
  { input: 'Coca-Cola gelada de 350ml', shouldNotContain: ['de', 'gelada'] }
];

async function executarTestes() {
  console.log('🧪 INICIANDO TESTES DE NORMALIZAÇÃO E MAPEAMENTOS\n');
  
  let testesPassaram = 0;
  let testesFalharam = 0;
  
  // Teste 1: Normalização de texto
  console.log('📝 Testando normalização de texto...');
  for (const teste of testesNormalizacao) {
    const resultado = normalizarTexto(teste.input);
    if (resultado === teste.expected) {
      console.log(`✅ "${teste.input}" -> "${resultado}"`);
      testesPassaram++;
    } else {
      console.log(`❌ "${teste.input}" -> "${resultado}" (esperado: "${teste.expected}")`);
      testesFalharam++;
    }
  }
  
  // Teste 2: Inicializar cardápio service
  console.log('\n🔧 Inicializando cardápio service...');
  try {
    await cardapioService.init();
    console.log('✅ Cardápio service inicializado');
    testesPassaram++;
  } catch (error) {
    console.log('❌ Erro ao inicializar cardápio service:', error.message);
    testesFalharam++;
  }
  
  // Teste 3: Busca de itens
  console.log('\n🔍 Testando busca de itens...');
  for (const teste of testesBuscaItens) {
    try {
      const resultado = await getItemIdByName(teste.input);
      const tipoResultado = resultado === null ? 'null' : typeof resultado;
      
      if (tipoResultado === teste.expectedType) {
        console.log(`✅ "${teste.input}" -> ${resultado} (${tipoResultado})`);
        testesPassaram++;
      } else {
        console.log(`❌ "${teste.input}" -> ${resultado} (${tipoResultado}, esperado: ${teste.expectedType})`);
        testesFalharam++;
      }
    } catch (error) {
      console.log(`❌ Erro ao buscar "${teste.input}": ${error.message}`);
      testesFalharam++;
    }
  }
  
  // Teste 4: Limpeza de descrição
  console.log('\n🧹 Testando limpeza de descrição...');
  for (const teste of testesLimpezaDescricao) {
    const resultado = limparDescricao(teste.input);
    let passou = true;
    
    for (const palavraProibida of teste.shouldNotContain) {
      if (resultado.includes(palavraProibida)) {
        passou = false;
        break;
      }
    }
    
    if (passou) {
      console.log(`✅ "${teste.input}" -> "${resultado}"`);
      testesPassaram++;
    } else {
      console.log(`❌ "${teste.input}" -> "${resultado}" (contém palavras que deveriam ser removidas)`);
      testesFalharam++;
    }
  }
  
  // Teste 5: Consistência de mapeamentos
  console.log('\n🗺️  Testando consistência de mapeamentos...');
  try {
    const mapeamentos = cardapioService.getMappings();
    const itens = cardapioService.getItems();
    
    let mapeamentosValidos = 0;
    let mapeamentosInvalidos = 0;
    
    for (const [gatilho, itemId] of Object.entries(mapeamentos)) {
      const itemExiste = itens.find(item => item.id === itemId);
      if (itemExiste) {
        mapeamentosValidos++;
      } else {
        console.log(`❌ Mapeamento órfão: "${gatilho}" -> ID ${itemId} (item não existe)`);
        mapeamentosInvalidos++;
      }
    }
    
    console.log(`✅ Mapeamentos válidos: ${mapeamentosValidos}`);
    if (mapeamentosInvalidos === 0) {
      console.log('✅ Nenhum mapeamento órfão encontrado');
      testesPassaram++;
    } else {
      console.log(`❌ ${mapeamentosInvalidos} mapeamentos órfãos encontrados`);
      testesFalharam++;
    }
    
  } catch (error) {
    console.log('❌ Erro ao verificar mapeamentos:', error.message);
    testesFalharam++;
  }
  
  // Teste 6: Teste de melhor match
  console.log('\n🎯 Testando algoritmo de melhor match...');
  const testesMatch = [
    { input: 'x burguer', opcoes: ['x burguer', 'x burguer bacon', 'x mega'], expectedIndex: 0 },
    { input: 'coca lata', opcoes: ['coca lata', 'coca 2 litros', 'coca zero'], expectedIndex: 0 },
    { input: 'batata', opcoes: ['batata frita', 'batata palito', 'batata rustica'], expectedIndex: 0 }
  ];
  
  for (const teste of testesMatch) {
    try {
      const resultado = encontrarMelhorMatch(teste.input, teste.opcoes);
      if (resultado && resultado.index === teste.expectedIndex) {
        console.log(`✅ "${teste.input}" -> "${teste.opcoes[resultado.index]}" (score: ${resultado.score.toFixed(2)})`);
        testesPassaram++;
      } else {
        const indexEncontrado = resultado ? resultado.index : 'null';
        console.log(`❌ "${teste.input}" -> index ${indexEncontrado} (esperado: ${teste.expectedIndex})`);
        testesFalharam++;
      }
    } catch (error) {
      console.log(`❌ Erro no teste de match "${teste.input}": ${error.message}`);
      testesFalharam++;
    }
  }
  
  // Resumo dos testes
  console.log('\n📊 RESUMO DOS TESTES');
  console.log('='.repeat(50));
  console.log(`✅ Testes que passaram: ${testesPassaram}`);
  console.log(`❌ Testes que falharam: ${testesFalharam}`);
  console.log(`📈 Taxa de sucesso: ${((testesPassaram / (testesPassaram + testesFalharam)) * 100).toFixed(1)}%`);
  
  if (testesFalharam === 0) {
    console.log('\n🎉 TODOS OS TESTES PASSARAM! Sistema está consistente.');
    return true;
  } else {
    console.log('\n⚠️  ALGUNS TESTES FALHARAM. Verifique os problemas acima.');
    return false;
  }
}

// Executa os testes se o arquivo for chamado diretamente
if (require.main === module) {
  executarTestes().then(sucesso => {
    process.exit(sucesso ? 0 : 1);
  }).catch(error => {
    console.error('❌ Erro fatal nos testes:', error);
    process.exit(1);
  });
}

module.exports = { executarTestes };