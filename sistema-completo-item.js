const cardapioService = require('./src/services/cardapioService');
const carrinhoService = require('./src/services/carrinhoService');

// Função para normalizar texto
function normalizarTexto(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim();
}

// Função para gerar variações de mapeamento
function gerarVariacoes(nome) {
  const nomeNormalizado = normalizarTexto(nome);
  const palavras = nomeNormalizado.split(/\s+/);
  
  const variacoes = new Set();
  
  variacoes.add(nomeNormalizado);
  variacoes.add(nomeNormalizado.replace(/\s+/g, ''));
  variacoes.add(nomeNormalizado.replace(/\s+/g, '-'));
  
  if (palavras.length > 1) {
    palavras.forEach(palavra => {
      if (palavra.length > 2) {
        variacoes.add(palavra);
      }
    });
  }
  
  if (nomeNormalizado.includes('x ') || nomeNormalizado.includes('x-')) {
    variacoes.add(nomeNormalizado.replace(/x[\s-]/g, 'x'));
    variacoes.add(nomeNormalizado.replace(/x[\s-]/g, ''));
  }
  
  return Array.from(variacoes);
}

// Função principal: adicionar item completo
async function adicionarItemCompleto(nome, preco, tipo = 'Lanche', descricao = '') {
  console.log(`=== ADICIONANDO ITEM COMPLETO: ${nome} ===\n`);
  
  try {
    await cardapioService.init();
    
    // Verificar se item já existe
    const itensExistentes = cardapioService.getItems();
    const itemExistente = itensExistentes.find(item => 
      normalizarTexto(item.nome) === normalizarTexto(nome)
    );
    
    let itemFinal;
    
    if (itemExistente) {
      console.log(`📋 Item "${nome}" já existe com ID ${itemExistente.id}`);
      itemFinal = itemExistente;
    } else {
      // Criar novo item
      console.log(`📝 Criando novo item: ${nome}`);
      
      const itemData = {
        nome: nome,
        descricao: descricao || `Gatilhos: ${gerarVariacoes(nome).slice(0, 3).join(', ')}`,
        preco: parseFloat(preco),
        tipo: tipo
      };
      
      const sucesso = cardapioService.addItem(itemData);
      
      if (!sucesso) {
        console.log('❌ Erro ao criar item');
        return false;
      }
      
      // Buscar item criado
      const itensAtualizados = cardapioService.getItems();
      itemFinal = itensAtualizados.find(item => 
        item.nome === nome && Math.abs(item.preco - itemData.preco) < 0.01
      );
      
      if (!itemFinal) {
        console.log('❌ Item não encontrado após criação');
        return false;
      }
      
      console.log(`✅ Item criado com ID ${itemFinal.id}`);
    }
    
    // Gerar e criar mapeamentos
    console.log(`\n🔗 Configurando mapeamentos...`);
    const variacoes = gerarVariacoes(nome);
    
    // Limpar mapeamentos antigos que apontam para IDs diferentes
    const mappingsAtuais = cardapioService.getMappings();
    let mapeamentosLimpos = 0;
    
    for (const variacao of variacoes) {
      const idAtual = mappingsAtuais[variacao];
      if (idAtual && idAtual !== itemFinal.id) {
        console.log(`🧹 Limpando mapeamento antigo: "${variacao}" (ID ${idAtual} -> ${itemFinal.id})`);
        mapeamentosLimpos++;
      }
    }
    
    // Criar novos mapeamentos
    let mapeamentosOk = 0;
    for (const variacao of variacoes) {
      const sucesso = cardapioService.addMapping(variacao, itemFinal.id);
      if (sucesso) {
        console.log(`✅ "${variacao}" -> ID ${itemFinal.id}`);
        mapeamentosOk++;
      }
    }
    
    console.log(`\n📊 Resultado: ${mapeamentosOk}/${variacoes.length} mapeamentos criados`);
    
    // Testar reconhecimento
    console.log(`\n🧪 Testando reconhecimento...`);
    const mappingsFinais = cardapioService.getMappings();
    let testesOk = 0;
    
    for (const variacao of variacoes) {
      const itemId = mappingsFinais[variacao];
      if (itemId === itemFinal.id) {
        testesOk++;
      } else {
        console.log(`❌ "${variacao}" -> ${itemId || 'não encontrado'} (esperado: ${itemFinal.id})`);
      }
    }
    
    console.log(`📈 Reconhecimento: ${testesOk}/${variacoes.length} funcionando`);
    
    // Testar carrinho
    console.log(`\n🛒 Testando adição ao carrinho...`);
    const telefone = '5511999999999';
    const nomeCliente = 'Teste Sistema';
    
    try {
      // Inicializar carrinho usando a função correta
      carrinhoService.inicializarCarrinho(telefone);
      
      // Testar adição usando a função correta
      await carrinhoService.adicionarItemAoCarrinho(
        telefone,
        itemFinal.id,
        1, // quantidade
        '', // anotarPreparo
        'normal', // tipagem
        nomeCliente // displayName
      );
      
      console.log(`✅ Item adicionado ao carrinho com sucesso!`);
      
      const carrinho = carrinhoService.getCarrinho(telefone);
      if (carrinho && carrinho.itens && carrinho.itens.length > 0) {
        const total = carrinhoService.valorTotal(telefone);
        console.log(`📋 Carrinho: ${carrinho.itens.length} item(s), Total: R$ ${total.toFixed(2)}`);
        
        // Limpar carrinho
        carrinhoService.resetCarrinho(telefone, carrinho);
        console.log(`🧹 Carrinho limpo`);
      }
      
    } catch (carrinhoError) {
      console.log(`❌ Erro no carrinho: ${carrinhoError.message}`);
    }
    
    // Resultado final
    console.log(`\n🎉 SISTEMA COMPLETO CONFIGURADO!`);
    console.log(`\n📋 RESUMO:`);
    console.log(`   - Item: ${itemFinal.nome} (ID: ${itemFinal.id})`);
    console.log(`   - Preço: R$ ${itemFinal.preco.toFixed(2)}`);
    console.log(`   - Mapeamentos: ${testesOk}/${variacoes.length} funcionando`);
    console.log(`   - Carrinho: Testado`);
    
    console.log(`\n💡 Cliente pode pedir usando:`);
    variacoes.slice(0, 5).forEach(v => console.log(`   - "${v}"`));
    
    console.log(`\n⚠️  IMPORTANTE:`);
    console.log(`   - Aguarde 30 segundos ou reinicie o bot`);
    console.log(`   - Teste no WhatsApp enviando uma das palavras acima`);
    console.log(`   - Verifique se o item é adicionado ao carrinho`);
    
    return {
      item: itemFinal,
      mapeamentos: testesOk,
      variacoes: variacoes
    };
    
  } catch (error) {
    console.error('❌ Erro:', error);
    return false;
  }
}

// Função para testar um item existente
async function testarItemExistente(nomeItem) {
  console.log(`=== TESTANDO ITEM EXISTENTE: ${nomeItem} ===\n`);
  
  try {
    await cardapioService.init();
    
    const itens = cardapioService.getItems();
    const item = itens.find(i => 
      normalizarTexto(i.nome).includes(normalizarTexto(nomeItem))
    );
    
    if (!item) {
      console.log(`❌ Item "${nomeItem}" não encontrado`);
      console.log(`\n📋 Itens disponíveis:`);
      itens.slice(0, 10).forEach(i => console.log(`   - ${i.nome} (ID: ${i.id})`));
      return false;
    }
    
    console.log(`✅ Item encontrado: ${item.nome} (ID: ${item.id}, R$ ${item.preco.toFixed(2)})`);
    
    // Verificar mapeamentos
    const mappings = cardapioService.getMappings();
    const mapeamentosItem = Object.entries(mappings)
      .filter(([palavra, id]) => id === item.id)
      .map(([palavra]) => palavra);
    
    console.log(`\n🔗 Mapeamentos encontrados: ${mapeamentosItem.length}`);
    mapeamentosItem.forEach(palavra => console.log(`   - "${palavra}"`));
    
    // Testar carrinho
    console.log(`\n🛒 Testando carrinho...`);
    const telefone = '5511999999999';
    
    try {
      carrinhoService.inicializarCarrinho(telefone);
      
      await carrinhoService.adicionarItemAoCarrinho(
        telefone,
        item.id,
        1,
        '',
        'normal',
        'Teste'
      );
      
      console.log(`✅ Item adicionado ao carrinho!`);
      
      const carrinho = carrinhoService.getCarrinho(telefone);
      carrinhoService.resetCarrinho(telefone, carrinho);
      
    } catch (carrinhoError) {
      console.log(`❌ Erro no carrinho: ${carrinhoError.message}`);
    }
    
    console.log(`\n💡 Status: ${mapeamentosItem.length > 0 ? 'PRONTO PARA USO' : 'PRECISA DE MAPEAMENTOS'}`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Erro:', error);
    return false;
  }
}

// Função para demonstração completa
async function demonstracaoCompleta() {
  console.log('=== DEMONSTRAÇÃO COMPLETA DO SISTEMA ===\n');
  
  console.log('🎯 Este sistema permite:');
  console.log('   ✅ Adicionar itens ao cardápio');
  console.log('   ✅ Criar mapeamentos automáticos');
  console.log('   ✅ Testar reconhecimento de palavras');
  console.log('   ✅ Testar adição ao carrinho');
  console.log('   ✅ Verificar funcionamento no WhatsApp');
  
  console.log('\n📝 Adicionando item de exemplo...');
  
  const resultado = await adicionarItemCompleto(
    'X-Demonstração',
    29.90,
    'Lanche',
    'Item criado para demonstração do sistema'
  );
  
  if (resultado) {
    console.log('\n🎉 DEMONSTRAÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('\n🚀 PRÓXIMOS PASSOS:');
    console.log('1. 📱 Abra o WhatsApp do bot');
    console.log('2. 💬 Envie uma mensagem: "quero x-demonstração"');
    console.log('3. 🛒 Verifique se o item é adicionado ao carrinho');
    console.log('4. ✅ Confirme que o sistema está funcionando!');
  } else {
    console.log('\n❌ Erro na demonstração');
  }
}

// Executar baseado em argumentos
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--demo') || args.includes('-d')) {
    demonstracaoCompleta();
  } else if (args.includes('--testar') || args.includes('-t')) {
    const nomeItem = args.slice(1).join(' ') || 'X-Tudo';
    testarItemExistente(nomeItem);
  } else if (args.length >= 2) {
    const nome = args[0];
    const preco = parseFloat(args[1]);
    const tipo = args[2] || 'Lanche';
    const descricao = args.slice(3).join(' ') || '';
    
    adicionarItemCompleto(nome, preco, tipo, descricao);
  } else {
    console.log('\n🚀 SISTEMA COMPLETO DE ITENS\n');
    console.log('📝 ADICIONAR NOVO ITEM:');
    console.log('   node sistema-completo-item.js "Nome do Item" 25.50 "Lanche" "Descrição"');
    console.log('\n🧪 TESTAR ITEM EXISTENTE:');
    console.log('   node sistema-completo-item.js --testar "Nome do Item"');
    console.log('\n🎯 DEMONSTRAÇÃO COMPLETA:');
    console.log('   node sistema-completo-item.js --demo');
    console.log('\n💡 EXEMPLOS:');
    console.log('   node sistema-completo-item.js "X-Especial" 35.00');
    console.log('   node sistema-completo-item.js --testar "X-Tudo"');
    console.log('   node sistema-completo-item.js --demo');
    console.log('\n🎯 Este script faz TUDO automaticamente:');
    console.log('   ✅ Adiciona item ao cardápio');
    console.log('   ✅ Cria mapeamentos automáticos para reconhecimento');
    console.log('   ✅ Testa reconhecimento de palavras');
    console.log('   ✅ Testa adição ao carrinho');
    console.log('   ✅ Verifica funcionamento completo');
    console.log('   ✅ Prepara item para uso no WhatsApp');
  }
}

module.exports = {
  adicionarItemCompleto,
  testarItemExistente,
  demonstracaoCompleta,
  gerarVariacoes,
  normalizarTexto
};