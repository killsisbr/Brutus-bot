// Script para verificar o estado dos pedidos no banco
const clientService = require('./src/services/clienteService');

async function verificarBanco() {
  try {
    console.log('=== VERIFICANDO ESTADO DOS PEDIDOS NO BANCO ===');
    
    // Aguardar inicialização do banco
    await clientService.dbReady;
    console.log('✓ Banco de dados inicializado');
    
    // Obter todos os pedidos
    const pedidos = clientService.obterPedidosPorEstado(null);
    console.log(`\nTotal de pedidos no banco: ${pedidos.length}`);
    
    // Filtrar pedidos de hoje
    const hoje = new Date().toDateString();
    const pedidosHoje = pedidos.filter(p => {
      if (!p.ts) return false;
      return new Date(p.ts).toDateString() === hoje;
    });
    
    console.log(`\nPedidos de hoje: ${pedidosHoje.length}`);
    console.log('\n=== DETALHES DOS PEDIDOS ===');
    
    pedidosHoje.forEach(p => {
      console.log(`ID: ${p.id}`);
      console.log(`Cliente: ${p.cliente}`);
      console.log(`Estado: ${p.estado}`);
      console.log(`Total: R$ ${p.total}`);
      console.log(`Timestamp: ${new Date(p.ts).toLocaleString()}`);
      console.log('---');
    });
    
    // Contar por estado
    const estadosCount = {};
    let totalProdutos = 0;
    let totalEntregues = 0;
    
    pedidosHoje.forEach(p => {
      const estado = p.estado || 'indefinido';
      estadosCount[estado] = (estadosCount[estado] || 0) + 1;
      
      const valor = parseFloat(p.total) || 0;
      if (estado === 'saiu_para_entrega' || estado === 'entregue') {
        totalEntregues += valor;
      } else {
        totalProdutos += valor;
      }
    });
    
    console.log('\n=== CONTAGEM POR ESTADO ===');
    Object.entries(estadosCount).forEach(([estado, count]) => {
      console.log(`${estado}: ${count} pedidos`);
    });
    
    console.log('\n=== TOTAIS CALCULADOS ===');
    console.log(`Total Produtos: R$ ${totalProdutos.toFixed(2)}`);
    console.log(`Total Entregas: R$ ${totalEntregues.toFixed(2)}`);
    
  } catch (error) {
    console.error('Erro na verificação:', error);
  }
}

verificarBanco();