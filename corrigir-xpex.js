const cardapioService = require('./src/services/cardapioService');

async function corrigirXpex() {
  try {
    console.log('=== CORRIGINDO MAPEAMENTO XPEX ===');
    
    // Inicializar o serviço
    await cardapioService.init();
    console.log('✅ CardapioService inicializado');
    
    // Buscar itens X-Frango
    const itens = cardapioService.getItems();
    const itensFrango = itens.filter(item => 
      item.nome && item.nome.toLowerCase().includes('frango')
    );
    
    console.log('\n🐔 Itens de frango encontrados:');
    itensFrango.forEach(item => {
      console.log(`   - ID: ${item.id}, Nome: "${item.nome}", Preço: R$ ${item.preco}, Tipo: ${item.tipo}`);
    });
    
    // Escolher o item X-Frango mais recente (maior ID)
    const xFrangoEscolhido = itensFrango.reduce((prev, current) => 
      (prev.id > current.id) ? prev : current
    );
    
    if (!xFrangoEscolhido) {
      console.log('❌ Nenhum item de frango encontrado');
      return;
    }
    
    console.log(`\n🎯 Item escolhido para mapeamento:`);
    console.log(`   - ID: ${xFrangoEscolhido.id}`);
    console.log(`   - Nome: "${xFrangoEscolhido.nome}"`);
    console.log(`   - Preço: R$ ${xFrangoEscolhido.preco}`);
    
    // Verificar se o mapeamento já existe
    const mappings = cardapioService.getMappings();
    const xpexExistente = mappings['xpex'];
    
    if (xpexExistente) {
      console.log(`\n⚠️  Mapeamento 'xpex' já existe apontando para ID ${xpexExistente}`);
      const itemExistente = itens.find(i => i.id === xpexExistente);
      if (itemExistente) {
        console.log(`   - Item atual: "${itemExistente.nome}"`);
      }
      console.log('   - Sobrescrevendo com o novo mapeamento...');
    }
    
    // Adicionar o mapeamento
    console.log('\n🔧 Adicionando mapeamento "xpex"...');
    const sucesso = cardapioService.addMapping('xpex', xFrangoEscolhido.id);
    
    if (sucesso) {
      console.log(`✅ Mapeamento "xpex" -> "${xFrangoEscolhido.nome}" (ID: ${xFrangoEscolhido.id}) adicionado com sucesso!`);
      
      // Verificar se foi salvo corretamente
      await cardapioService.init(); // Recarregar
      const mappingsAtualizados = cardapioService.getMappings();
      const xpexVerificacao = mappingsAtualizados['xpex'];
      
      if (xpexVerificacao === xFrangoEscolhido.id) {
        console.log('✅ Verificação: Mapeamento salvo corretamente no banco de dados');
      } else {
        console.log('❌ Verificação: Problema ao salvar no banco de dados');
      }
      
      // Adicionar variações comuns também
       console.log('\n🔧 Adicionando variações do mapeamento...');
       const variacoes = ['x-pex', 'x pex'];
       let variacoesAdicionadas = 0;
       
       for (const variacao of variacoes) {
         if (!mappingsAtualizados[variacao]) {
           const sucessoVariacao = cardapioService.addMapping(variacao, xFrangoEscolhido.id);
           if (sucessoVariacao) {
             console.log(`✅ Variação "${variacao}" adicionada`);
             variacoesAdicionadas++;
           } else {
             console.log(`❌ Erro ao adicionar variação "${variacao}"`);
           }
         } else {
           console.log(`⚠️  Variação "${variacao}" já existe`);
         }
       }
       
       console.log(`\n📊 Resumo: ${variacoesAdicionadas}/${variacoes.length} variações adicionadas`);
       
    } else {
      console.log('❌ Erro ao adicionar mapeamento');
      return;
    }
    
    // Instruções finais
    console.log('\n=== PRÓXIMOS PASSOS ===');
    console.log('\n1. ✅ MAPEAMENTO ADICIONADO:');
    console.log(`   - "xpex" agora aponta para "${xFrangoEscolhido.nome}"`);
    console.log('   - Este é um mapeamento temporário baseado na melhor suposição');
    
    console.log('\n2. 🧪 TESTAR:');
    console.log('   - Aguardar 30 segundos para o cache atualizar');
    console.log('   - Ou reiniciar o bot para forçar atualização');
    console.log('   - Enviar "xpex" no WhatsApp para testar');
    
    console.log('\n3. 🔍 VERIFICAR SE ESTÁ CORRETO:');
    console.log('   - Se o cliente confirmar que "xpex" é outro item, ajustar o mapeamento');
    console.log('   - Usar: cardapioService.addMapping("xpex", ID_CORRETO)');
    
    console.log('\n4. ⚠️  IMPORTANTE:');
    console.log('   - Este é um mapeamento temporário baseado em suposição');
    console.log('   - Verificar com o proprietário qual item deveria ser "xpex"');
    console.log('   - Pode ser necessário ajustar para o item correto');
    
    console.log('\n🎉 Correção temporária aplicada com sucesso!');
    console.log('💡 O problema de reconhecimento do "xpex" deve estar resolvido agora');
    
  } catch (error) {
    console.error('❌ Erro ao corrigir xpex:', error);
  }
}

corrigirXpex();