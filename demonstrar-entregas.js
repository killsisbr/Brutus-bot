// Script para demonstrar o total de entregas
const clientService = require('./src/services/clienteService');

async function demonstrarEntregas() {
  try {
    console.log('=== DEMONSTRANDO TOTAL DE ENTREGAS ===');
    
    // Aguardar inicialização do banco
    await clientService.dbReady;
    console.log('✓ Banco de dados inicializado');
    
    // Obter pedidos existentes
    const pedidos = clientService.obterPedidosPorEstado(null);
    const hoje = new Date().toDateString();
    const pedidosHoje = pedidos.filter(p => {
      if (!p.ts) return false;
      return new Date(p.ts).toDateString() === hoje;
    });
    
    console.log(`\nPedidos encontrados hoje: ${pedidosHoje.length}`);
    
    if (pedidosHoje.length > 0) {
      // Pegar os primeiros 2 pedidos e marcar como entregues
      const pedidosParaEntregar = pedidosHoje.slice(0, 2);
      
      console.log('\n=== MARCANDO PEDIDOS COMO ENTREGUES ===');
      
      for (const pedido of pedidosParaEntregar) {
        await clientService.atualizarEstadoPedido(pedido.id, 'entregue');
        console.log(`✓ Pedido ${pedido.id} marcado como ENTREGUE - R$ ${pedido.total}`);
      }
      
      // Calcular totais
      console.log('\n=== CALCULANDO TOTAIS APÓS ENTREGAS ===');
      
      const pedidosAtualizados = clientService.obterPedidosPorEstado(null);
      const pedidosHojeAtualizados = pedidosAtualizados.filter(p => {
        if (!p.ts) return false;
        return new Date(p.ts).toDateString() === hoje;
      });
      
      let totalProdutos = 0;
      let totalEntregues = 0;
      let countProdutos = 0;
      let countEntregues = 0;
      
      pedidosHojeAtualizados.forEach(p => {
        const valor = parseFloat(p.total) || 0;
        if (p.estado === 'saiu_para_entrega' || p.estado === 'entregue') {
          totalEntregues += valor;
          countEntregues++;
          console.log(`🚚 ENTREGUE: ${p.id} - R$ ${valor.toFixed(2)}`);
        } else {
          totalProdutos += valor;
          countProdutos++;
          console.log(`🍔 PRODUTO: ${p.id} - R$ ${valor.toFixed(2)}`);
        }
      });
      
      console.log('\n=== 💰 RESUMO FINANCEIRO 💰 ===');
      console.log(`🚚 Total em Entregas: R$ ${totalEntregues.toFixed(2)} (${countEntregues} pedidos)`);
      console.log(`🍔 Total em Produtos: R$ ${totalProdutos.toFixed(2)} (${countProdutos} pedidos)`);
      console.log(`📊 Total Geral do Dia: R$ ${(totalEntregues + totalProdutos).toFixed(2)}`);
      
      console.log('\n✅ Acesse http://localhost:3001/pedidos.html para ver o painel atualizado!');
      console.log('💡 O total de entregas agora aparece destacado em verde no cabeçalho!');
      
    } else {
      console.log('\n❌ Nenhum pedido encontrado para hoje. Execute primeiro alguns pedidos.');
    }
    
  } catch (error) {
    console.error('Erro na demonstração:', error);
  }
}

demonstrarEntregas();