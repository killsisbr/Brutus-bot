const cardapioService = require('./src/services/cardapioService');

async function adicionarXMega() {
  try {
    console.log('=== ADICIONANDO X-MEGA AO CARDÁPIO ===');
    
    // Inicializar o serviço
    await cardapioService.init();
    console.log('✅ CardapioService inicializado');
    
    // Dados do item X-Mega baseado na imagem
    const itemXMega = {
      id: 222, // ID conforme mostrado na imagem
      nome: 'X-Mega',
      descricao: 'Gatilhos: mega, megax',
      preco: 51.00, // Preço conforme mostrado na imagem
      tipo: 'Lanche'
    };
    
    console.log('\n📝 Adicionando item ao cardápio...');
    const itemAdicionado = cardapioService.addItem(itemXMega);
    
    if (itemAdicionado) {
      console.log(`✅ Item "${itemXMega.nome}" adicionado com sucesso!`);
      console.log(`   - ID: ${itemXMega.id}`);
      console.log(`   - Nome: ${itemXMega.nome}`);
      console.log(`   - Preço: R$ ${itemXMega.preco}`);
      console.log(`   - Tipo: ${itemXMega.tipo}`);
    } else {
      console.log('❌ Erro ao adicionar item');
      return;
    }
    
    // Criar mapeamentos para diferentes variações
    const mapeamentos = [
      'x-mega',
      'xmega', 
      'mega',
      'x mega',
      'megax',
      'x-megax',
      'xmegax'
    ];
    
    console.log('\n🔗 Criando mapeamentos...');
    let mapeamentosAdicionados = 0;
    
    for (const palavra of mapeamentos) {
      const sucesso = cardapioService.addMapping(palavra, itemXMega.id);
      if (sucesso) {
        console.log(`✅ Mapeamento "${palavra}" -> ID ${itemXMega.id}`);
        mapeamentosAdicionados++;
      } else {
        console.log(`❌ Erro ao criar mapeamento "${palavra}"`);
      }
    }
    
    console.log(`\n📊 Resumo: ${mapeamentosAdicionados}/${mapeamentos.length} mapeamentos criados`);
    
    // Verificar se tudo foi salvo corretamente
    console.log('\n🔍 Verificando se o item foi salvo...');
    const itens = cardapioService.getItems();
    const itemVerificacao = itens.find(item => item.id === itemXMega.id);
    
    if (itemVerificacao) {
      console.log('✅ Item encontrado no cardápio:');
      console.log(`   - Nome: "${itemVerificacao.nome}"`);
      console.log(`   - Preço: R$ ${itemVerificacao.preco}`);
    } else {
      console.log('❌ Item não encontrado após adição');
    }
    
    // Verificar mapeamentos
    console.log('\n🔍 Verificando mapeamentos...');
    const mappings = cardapioService.getMappings();
    
    for (const palavra of mapeamentos) {
      const itemId = mappings[palavra.toLowerCase()];
      if (itemId === itemXMega.id) {
        console.log(`✅ "${palavra}" -> ID ${itemId}`);
      } else {
        console.log(`❌ "${palavra}" -> Não mapeado ou ID incorreto`);
      }
    }
    
    console.log('\n🎉 X-Mega adicionado com sucesso!');
    console.log('💡 Agora o cliente pode pedir usando: x-mega, xmega, mega, etc.');
    console.log('⚠️  Lembre-se: aguarde 30 segundos ou reinicie o bot para o cache atualizar');
    
  } catch (error) {
    console.error('❌ Erro ao adicionar X-Mega:', error);
  }
}

adicionarXMega();