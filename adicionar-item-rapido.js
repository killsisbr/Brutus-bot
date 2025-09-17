const cardapioService = require('./src/services/cardapioService');
const readline = require('readline');

// Interface para entrada do usuário
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Função para fazer perguntas
function pergunta(questao) {
  return new Promise((resolve) => {
    rl.question(questao, (resposta) => {
      resolve(resposta.trim());
    });
  });
}

// Função para normalizar texto (remover acentos, caracteres especiais)
function normalizarTexto(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
    .trim();
}

// Função para gerar variações de mapeamento
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
  
  // Adicionar abreviações comuns
  if (nomeNormalizado.includes('x-')) {
    variacoes.add(nomeNormalizado.replace('x-', 'x'));
    variacoes.add(nomeNormalizado.replace('x-', ''));
  }
  
  return Array.from(variacoes);
}

async function adicionarItemRapido() {
  try {
    console.log('=== ADICIONAR ITEM RÁPIDO AO CARDÁPIO ===\n');
    
    // Inicializar serviço
    await cardapioService.init();
    console.log('✅ Sistema inicializado\n');
    
    // Coletar informações do item
    console.log('📝 Vamos adicionar um novo item ao cardápio:');
    
    const nome = await pergunta('Nome do item: ');
    if (!nome) {
      console.log('❌ Nome é obrigatório!');
      rl.close();
      return;
    }
    
    const descricao = await pergunta('Descrição (opcional): ');
    
    let preco;
    while (true) {
      const precoStr = await pergunta('Preço (ex: 25.50): R$ ');
      preco = parseFloat(precoStr.replace(',', '.'));
      if (!isNaN(preco) && preco > 0) {
        break;
      }
      console.log('❌ Preço inválido! Digite um número válido.');
    }
    
    console.log('\nTipos disponíveis: Lanche, Bebida, Porção, Adicional, Sobremesa');
    const tipo = await pergunta('Tipo do item: ') || 'Lanche';
    
    // Gerar variações de mapeamento
    const variacoes = gerarVariacoes(nome);
    
    console.log('\n🔗 Variações que serão criadas para busca:');
    variacoes.forEach((variacao, index) => {
      console.log(`   ${index + 1}. "${variacao}"`);
    });
    
    const confirmar = await pergunta('\nConfirmar adição? (s/n): ');
    if (confirmar.toLowerCase() !== 's' && confirmar.toLowerCase() !== 'sim') {
      console.log('❌ Operação cancelada.');
      rl.close();
      return;
    }
    
    console.log('\n⏳ Adicionando item...');
    
    // Adicionar item ao cardápio
    const itemData = {
      nome: nome,
      descricao: descricao || `Gatilhos: ${variacoes.slice(0, 3).join(', ')}`,
      preco: preco,
      tipo: tipo
    };
    
    const itemAdicionado = cardapioService.addItem(itemData);
    
    if (!itemAdicionado) {
      console.log('❌ Erro ao adicionar item ao cardápio!');
      rl.close();
      return;
    }
    
    // Obter o ID do item adicionado
    const itens = cardapioService.getItems();
    const itemCriado = itens.find(item => 
      item.nome === nome && Math.abs(item.preco - preco) < 0.01
    );
    
    if (!itemCriado) {
      console.log('❌ Erro: Item não encontrado após adição!');
      rl.close();
      return;
    }
    
    console.log(`✅ Item adicionado com sucesso!`);
    console.log(`   - ID: ${itemCriado.id}`);
    console.log(`   - Nome: "${itemCriado.nome}"`);
    console.log(`   - Preço: R$ ${itemCriado.preco.toFixed(2)}`);
    console.log(`   - Tipo: ${itemCriado.tipo}`);
    
    // Criar mapeamentos
    console.log('\n🔗 Criando mapeamentos...');
    let mapeamentosOk = 0;
    
    for (const variacao of variacoes) {
      const sucesso = cardapioService.addMapping(variacao, itemCriado.id);
      if (sucesso) {
        console.log(`✅ "${variacao}" -> ID ${itemCriado.id}`);
        mapeamentosOk++;
      } else {
        console.log(`❌ Erro ao mapear "${variacao}"`);
      }
    }
    
    console.log(`\n📊 ${mapeamentosOk}/${variacoes.length} mapeamentos criados`);
    
    // Teste rápido
    console.log('\n🧪 Testando reconhecimento...');
    const mappings = cardapioService.getMappings();
    
    let testesOk = 0;
    for (const variacao of variacoes.slice(0, 3)) { // Testar apenas as 3 primeiras
      const itemId = mappings[variacao];
      if (itemId === itemCriado.id) {
        console.log(`✅ "${variacao}" reconhecido corretamente`);
        testesOk++;
      } else {
        console.log(`❌ "${variacao}" não reconhecido`);
      }
    }
    
    // Resultado final
    console.log('\n=== RESULTADO ===');
    
    if (testesOk > 0) {
      console.log('🎉 SUCESSO! Item adicionado e funcionando!');
      console.log('\n💡 O cliente já pode pedir usando:');
      variacoes.slice(0, 5).forEach(v => console.log(`   - "${v}"`));
      console.log('\n⚠️  IMPORTANTE:');
      console.log('   - Aguarde 30 segundos para o cache atualizar');
      console.log('   - Ou reinicie o bot para aplicar imediatamente');
      console.log('   - Teste enviando uma mensagem no WhatsApp');
    } else {
      console.log('❌ Item adicionado mas há problemas nos mapeamentos');
      console.log('💡 Verifique manualmente ou execute o script de diagnóstico');
    }
    
    rl.close();
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
    rl.close();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  adicionarItemRapido();
}

module.exports = { adicionarItemRapido, gerarVariacoes, normalizarTexto };