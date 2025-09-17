const cardapioService = require('./src/services/cardapioService');

// Função para normalizar texto (remover acentos, caracteres especiais)
function normalizarTexto(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
    .trim();
}

// Função para gerar variações de mapeamento automaticamente
function gerarVariacoes(nome) {
  const nomeNormalizado = normalizarTexto(nome);
  const palavras = nomeNormalizado.split(/\s+/);
  
  const variacoes = new Set();
  
  // Adicionar nome completo normalizado
  variacoes.add(nomeNormalizado);
  
  // Adicionar sem espaços
  variacoes.add(nomeNormalizado.replace(/\s+/g, ''));
  
  // Adicionar com hífen
  variacoes.add(nomeNormalizado.replace(/\s+/g, '-'));
  
  // Adicionar palavras individuais (se mais de uma palavra)
  if (palavras.length > 1) {
    palavras.forEach(palavra => {
      if (palavra.length > 2) { // Só palavras com mais de 2 caracteres
        variacoes.add(palavra);
      }
    });
  }
  
  // Adicionar abreviações comuns para lanches com X
  if (nomeNormalizado.includes('x ') || nomeNormalizado.includes('x-')) {
    variacoes.add(nomeNormalizado.replace(/x[\s-]/g, 'x'));
    variacoes.add(nomeNormalizado.replace(/x[\s-]/g, ''));
  }
  
  return Array.from(variacoes);
}

// Função principal para adicionar item
async function adicionarItem(nome, preco, tipo = 'Lanche', descricao = '') {
  try {
    console.log(`=== ADICIONANDO: ${nome} ===`);
    
    // Inicializar serviço
    await cardapioService.init();
    
    // Gerar variações de mapeamento
    const variacoes = gerarVariacoes(nome);
    
    // Dados do item
    const itemData = {
      nome: nome,
      descricao: descricao || `Gatilhos: ${variacoes.slice(0, 3).join(', ')}`,
      preco: parseFloat(preco),
      tipo: tipo
    };
    
    console.log(`📝 Dados do item:`);
    console.log(`   - Nome: "${itemData.nome}"`);
    console.log(`   - Preço: R$ ${itemData.preco.toFixed(2)}`);
    console.log(`   - Tipo: ${itemData.tipo}`);
    
    // Adicionar item
    const itemAdicionado = cardapioService.addItem(itemData);
    
    if (!itemAdicionado) {
      console.log('❌ Erro ao adicionar item!');
      return false;
    }
    
    // Obter ID do item criado
    const itens = cardapioService.getItems();
    const itemCriado = itens.find(item => 
      item.nome === nome && Math.abs(item.preco - itemData.preco) < 0.01
    );
    
    if (!itemCriado) {
      console.log('❌ Item não encontrado após adição!');
      return false;
    }
    
    console.log(`✅ Item criado com ID: ${itemCriado.id}`);
    
    // Criar mapeamentos
    console.log(`\n🔗 Criando ${variacoes.length} mapeamentos...`);
    let mapeamentosOk = 0;
    
    for (const variacao of variacoes) {
      const sucesso = cardapioService.addMapping(variacao, itemCriado.id);
      if (sucesso) {
        console.log(`✅ "${variacao}" -> ID ${itemCriado.id}`);
        mapeamentosOk++;
      } else {
        console.log(`❌ Erro: "${variacao}"`);
      }
    }
    
    // Verificar mapeamentos
    console.log(`\n🧪 Verificando mapeamentos...`);
    const mappings = cardapioService.getMappings();
    let testesOk = 0;
    
    for (const variacao of variacoes) {
      const itemId = mappings[variacao];
      if (itemId === itemCriado.id) {
        testesOk++;
      }
    }
    
    console.log(`\n📊 Resultado: ${testesOk}/${variacoes.length} mapeamentos funcionando`);
    
    if (testesOk > 0) {
      console.log('🎉 SUCESSO! Item pronto para uso!');
      console.log('\n💡 Cliente pode pedir usando:');
      variacoes.slice(0, 5).forEach(v => console.log(`   - "${v}"`));
      console.log('\n⚠️  Aguarde 30 segundos ou reinicie o bot');
      return true;
    } else {
      console.log('❌ Problemas nos mapeamentos');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    return false;
  }
}

// Função para adicionar múltiplos itens
async function adicionarMultiplosItens(itens) {
  console.log(`=== ADICIONANDO ${itens.length} ITENS ===\n`);
  
  let sucessos = 0;
  
  for (let i = 0; i < itens.length; i++) {
    const item = itens[i];
    console.log(`\n[${i + 1}/${itens.length}] Processando...`);
    
    const sucesso = await adicionarItem(
      item.nome,
      item.preco,
      item.tipo || 'Lanche',
      item.descricao || ''
    );
    
    if (sucesso) {
      sucessos++;
    }
    
    console.log('\n' + '='.repeat(50));
  }
  
  console.log(`\n🎯 RESUMO FINAL: ${sucessos}/${itens.length} itens adicionados com sucesso!`);
  
  if (sucessos === itens.length) {
    console.log('🎉 Todos os itens foram adicionados e estão funcionando!');
  } else {
    console.log('⚠️  Alguns itens tiveram problemas. Verifique os logs acima.');
  }
}

// Exemplos de uso
async function exemploUso() {
  console.log('=== EXEMPLOS DE USO ===\n');
  
  // Exemplo 1: Item único
  console.log('📝 Exemplo 1: Adicionando um item único');
  await adicionarItem('X-Frango', 28.50, 'Lanche', 'Hambúrguer de frango grelhado');
  
  console.log('\n' + '='.repeat(60) + '\n');
  
  // Exemplo 2: Múltiplos itens
  console.log('📝 Exemplo 2: Adicionando múltiplos itens');
  const novosItens = [
    {
      nome: 'X-Vegano',
      preco: 32.00,
      tipo: 'Lanche',
      descricao: 'Hambúrguer vegano com proteína de soja'
    },
    {
      nome: 'Batata Rústica',
      preco: 18.00,
      tipo: 'Porção',
      descricao: 'Batata rústica temperada'
    },
    {
      nome: 'Suco Natural',
      preco: 8.00,
      tipo: 'Bebida',
      descricao: 'Suco natural de frutas'
    }
  ];
  
  await adicionarMultiplosItens(novosItens);
}

// Executar exemplos se chamado diretamente
if (require.main === module) {
  // Descomente a linha abaixo para executar os exemplos
  // exemploUso();
  
  // Ou adicione um item específico:
  // adicionarItem('Nome do Item', 25.00, 'Lanche');
  
  console.log('\n💡 COMO USAR:');
  console.log('\n1. Para um item único:');
  console.log('   adicionarItem("X-Especial", 35.00, "Lanche");');
  console.log('\n2. Para múltiplos itens:');
  console.log('   const itens = [{nome: "Item1", preco: 20}, {nome: "Item2", preco: 25}];');
  console.log('   adicionarMultiplosItens(itens);');
  console.log('\n3. Descomente exemploUso() para ver demonstração completa');
}

module.exports = {
  adicionarItem,
  adicionarMultiplosItens,
  gerarVariacoes,
  normalizarTexto
};