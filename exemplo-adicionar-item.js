const { adicionarItem, adicionarMultiplosItens } = require('./adicionar-item-direto');

async function exemploCompleto() {
  console.log('=== EXEMPLO PRÁTICO: ADICIONAR ITEM E TESTAR ===\n');
  
  try {
    // Exemplo 1: Adicionar um X-Especial
    console.log('🍔 Adicionando X-Especial...');
    const sucesso1 = await adicionarItem(
      'X-Especial da Casa',
      42.50,
      'Lanche',
      'Hambúrguer especial com ingredientes selecionados'
    );
    
    if (sucesso1) {
      console.log('\n✅ X-Especial adicionado! Cliente pode pedir usando:');
      console.log('   - "x especial"');
      console.log('   - "x-especial"');
      console.log('   - "especial"');
      console.log('   - "xespecial"');
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    // Exemplo 2: Adicionar uma bebida
    console.log('🥤 Adicionando Milkshake...');
    const sucesso2 = await adicionarItem(
      'Milkshake de Chocolate',
      15.00,
      'Bebida',
      'Milkshake cremoso de chocolate'
    );
    
    if (sucesso2) {
      console.log('\n✅ Milkshake adicionado! Cliente pode pedir usando:');
      console.log('   - "milkshake"');
      console.log('   - "milk shake"');
      console.log('   - "chocolate"');
    }
    
    console.log('\n' + '='.repeat(60) + '\n');
    
    // Exemplo 3: Adicionar múltiplos itens de uma vez
    console.log('📦 Adicionando múltiplos itens...');
    
    const novosItens = [
      {
        nome: 'X-Picanha',
        preco: 48.00,
        tipo: 'Lanche',
        descricao: 'Hambúrguer de picanha grelhada'
      },
      {
        nome: 'Onion Rings',
        preco: 22.00,
        tipo: 'Porção',
        descricao: 'Anéis de cebola empanados e fritos'
      },
      {
        nome: 'Açaí 500ml',
        preco: 18.00,
        tipo: 'Sobremesa',
        descricao: 'Açaí natural com acompanhamentos'
      }
    ];
    
    await adicionarMultiplosItens(novosItens);
    
    console.log('\n🎉 EXEMPLO CONCLUÍDO!');
    console.log('\n💡 PRÓXIMOS PASSOS:');
    console.log('1. ⏰ Aguarde 30 segundos para o cache atualizar');
    console.log('2. 🔄 Ou reinicie o bot para aplicar imediatamente');
    console.log('3. 📱 Teste enviando mensagens no WhatsApp');
    console.log('4. 🛒 Verifique se os itens são adicionados ao carrinho');
    
    console.log('\n📋 ITENS ADICIONADOS HOJE:');
    console.log('- X-Especial da Casa (R$ 42,50)');
    console.log('- Milkshake de Chocolate (R$ 15,00)');
    console.log('- X-Picanha (R$ 48,00)');
    console.log('- Onion Rings (R$ 22,00)');
    console.log('- Açaí 500ml (R$ 18,00)');
    
  } catch (error) {
    console.error('❌ Erro no exemplo:', error);
  }
}

// Função para adicionar apenas um item específico
async function adicionarItemEspecifico() {
  console.log('=== ADICIONAR ITEM ESPECÍFICO ===\n');
  
  // Modifique aqui para adicionar o item que você quiser
  const nomeItem = 'X-Tudo';
  const precoItem = 35.00;
  const tipoItem = 'Lanche';
  const descricaoItem = 'Hambúrguer completo com todos os ingredientes';
  
  console.log(`🍔 Adicionando: ${nomeItem}`);
  
  const sucesso = await adicionarItem(
    nomeItem,
    precoItem,
    tipoItem,
    descricaoItem
  );
  
  if (sucesso) {
    console.log(`\n🎉 ${nomeItem} adicionado com sucesso!`);
    console.log('\n⚠️  IMPORTANTE:');
    console.log('- Aguarde 30 segundos ou reinicie o bot');
    console.log('- Teste no WhatsApp enviando o nome do item');
    console.log('- Verifique se é adicionado ao carrinho');
  } else {
    console.log(`\n❌ Erro ao adicionar ${nomeItem}`);
  }
}

// Executar baseado em argumentos da linha de comando
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--exemplo') || args.includes('-e')) {
    exemploCompleto();
  } else if (args.includes('--especifico') || args.includes('-s')) {
    adicionarItemEspecifico();
  } else {
    console.log('\n🚀 COMO USAR ESTE SCRIPT:\n');
    console.log('1. Exemplo completo (adiciona vários itens):');
    console.log('   node exemplo-adicionar-item.js --exemplo');
    console.log('\n2. Adicionar item específico:');
    console.log('   node exemplo-adicionar-item.js --especifico');
    console.log('\n3. Editar este arquivo para personalizar os itens');
    console.log('\n💡 DICA: Modifique a função adicionarItemEspecifico()');
    console.log('   para adicionar exatamente o item que você quer!');
  }
}

module.exports = {
  exemploCompleto,
  adicionarItemEspecifico
};