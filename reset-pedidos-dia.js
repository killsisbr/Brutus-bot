const clientService = require('./src/services/clienteService');

async function resetarPedidosDia() {
  console.log('=== RESETANDO PEDIDOS DO DIA ===');
  
  // Aguardar o banco estar pronto
  if (clientService.dbReady) {
    try {
      await clientService.dbReady;
      console.log('Banco de dados pronto!');
    } catch (e) {
      console.error('Erro ao aguardar banco:', e);
      return;
    }
  }

  try {
    // Buscar todos os pedidos
    const todosPedidos = clientService.obterPedidosPorEstado(null);
    console.log(`Total de pedidos no banco: ${todosPedidos.length}`);
    
    // Filtrar pedidos de hoje
    const hoje = new Date().toDateString();
    const pedidosHoje = todosPedidos.filter(p => {
      if (!p.ts) return false;
      const dataPedido = new Date(p.ts).toDateString();
      return dataPedido === hoje;
    });
    
    console.log(`Pedidos de hoje encontrados: ${pedidosHoje.length}`);
    
    if (pedidosHoje.length === 0) {
      console.log('✅ Não há pedidos de hoje para resetar.');
      return;
    }
    
    // Mostrar pedidos que serão removidos
    console.log('\n=== PEDIDOS QUE SERÃO REMOVIDOS ===');
    let totalRemover = 0;
    pedidosHoje.forEach((p, i) => {
      console.log(`${i + 1}. ID: ${p.id}, Total: R$ ${p.total}, Estado: ${p.estado}`);
      totalRemover += parseFloat(p.total) || 0;
    });
    console.log(`Total a ser removido: R$ ${totalRemover.toFixed(2)}`);
    
    // Remover pedidos de hoje usando a função existente
    const sucesso = clientService.resetarPedidosDia();
    
    if (sucesso) {
      console.log('\n✅ Pedidos do dia resetados com sucesso!');
      
      // Verificar resultado
      const pedidosRestantes = clientService.obterPedidosPorEstado(null);
      const pedidosHojeRestantes = pedidosRestantes.filter(p => {
        if (!p.ts) return false;
        const dataPedido = new Date(p.ts).toDateString();
        return dataPedido === hoje;
      });
      
      console.log(`Pedidos de hoje após reset: ${pedidosHojeRestantes.length}`);
      console.log(`Total de pedidos restantes no banco: ${pedidosRestantes.length}`);
      
    } else {
      console.log('❌ Erro ao resetar pedidos do dia.');
    }
    
  } catch (error) {
    console.error('❌ Erro ao resetar pedidos do dia:', error);
  }
}

resetarPedidosDia().catch(console.error);