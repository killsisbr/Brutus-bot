// Script para simular entregas e mostrar o total de dinheiro
const clientService = require('./src/services/clienteService');

async function simularEntregas() {
  try {
    console.log('=== SIMULANDO ENTREGAS PARA DEMONSTRAR TOTAIS ===');
    
    // Aguardar inicialização do banco
    await clientService.dbReady;
    console.log('✓ Banco de dados inicializado');
    
    // Criar alguns pedidos de exemplo
    const pedidosExemplo = [
      {
        id: 'exemplo_001',
        cliente: '5541999999999',
        ts: Date.now(),
        total: 45.50,
        endereco: { rua: 'Rua das Flores, 123', taxaEntrega: 5.00 },
        estado: 'entregue',
        items: [{ nome: 'X-Burger', quantidade: 1, preco: 40.50 }]
      },
      {
        id: 'exemplo_002', 
        cliente: '5541888888888',
        ts: Date.now(),
        total: 32.00,
        endereco: { rua: 'Av. Principal, 456', taxaEntrega: 4.00 },
        estado: 'entregue',
        items: [{ nome: 'X-Salada', quantidade: 1, preco: 28.00 }]
      },
      {
        id: 'exemplo_003',
        cliente: '5541777777777', 
        ts: Date.now(),
        total: 28.50,
        endereco: { rua: 'Rua do Centro, 789', taxaEntrega: 3.50 },
        estado: 'saiu_para_entrega',
        items: [{ nome: 'X-Bacon', quantidade: 1, preco: 25.00 }]
      },
      {
        id: 'exemplo_004',
        cliente: '5541666666666',
        ts: Date.now(),
        total: 22.00,
        endereco: null,
        estado: 'finalizado',
        items: [{ nome: 'Hambúrguer Simples', quantidade: 1, preco: 22.00 }]
      }
    ];
    
    console.log('\n=== ADICIONANDO PEDIDOS DE EXEMPLO ===');
    
    for (const pedido of pedidosExemplo) {
      await clientService.adicionarPedido(pedido.cliente, pedido);
      console.log(`✓ Pedido ${pedido.id} adicionado - Estado: ${pedido.estado} - Total: R$ ${pedido.total}`);
    }
    
    console.log('\n=== CALCULANDO TOTAIS ===');
    
    const hoje = new Date().toDateString();
    const todosPedidos = clientService.obterPedidosPorEstado(null);
    const pedidosHoje = todosPedidos.filter(p => {
      if (!p.ts) return false;
      return new Date(p.ts).toDateString() === hoje;
    });
    
    let totalProdutos = 0;
    let totalEntregues = 0;
    let countProdutos = 0;
    let countEntregues = 0;
    
    console.log('\n=== DETALHAMENTO DOS PEDIDOS ===');
    
    pedidosHoje.forEach(p => {
      const valor = parseFloat(p.total) || 0;
      if (p.estado === 'saiu_para_entrega' || p.estado === 'entregue') {
        totalEntregues += valor;
        countEntregues++;
        console.log(`🚚 ENTREGA: ${p.id} - ${p.estado} - R$ ${valor.toFixed(2)}`);
      } else {
        totalProdutos += valor;
        countProdutos++;
        console.log(`🍔 PRODUTO: ${p.id} - ${p.estado} - R$ ${valor.toFixed(2)}`);
      }
    });
    
    console.log('\n=== RESUMO FINANCEIRO ===');
    console.log(`💰 Total em Entregas: R$ ${totalEntregues.toFixed(2)} (${countEntregues} pedidos)`);
    console.log(`🍔 Total em Produtos: R$ ${totalProdutos.toFixed(2)} (${countProdutos} pedidos)`);
    console.log(`📊 Total Geral: R$ ${(totalEntregues + totalProdutos).toFixed(2)}`);
    
    console.log('\n✅ Agora acesse http://localhost:3001/pedidos.html para ver os totais atualizados!');
    
  } catch (error) {
    console.error('Erro na simulação:', error);
  }
}

simularEntregas();