// Script para testar um pedido de R$ 37 e analisar os totais
const clientService = require('./src/services/clienteService');

async function testarPedido37() {
  try {
    console.log('=== TESTANDO PEDIDO DE R$ 37 ===');
    
    // Aguardar inicialização do banco
    await clientService.dbReady;
    console.log('✓ Banco de dados inicializado');
    
    // Verificar totais antes do pedido
    console.log('\n=== TOTAIS ANTES DO PEDIDO ===');
    const pedidosAntes = clientService.obterPedidosPorEstado(null);
    const hoje = new Date().toDateString();
    const pedidosHojeAntes = pedidosAntes.filter(p => {
      if (!p.ts) return false;
      return new Date(p.ts).toDateString() === hoje;
    });
    
    let totalProdutosAntes = 0;
    let totalEntreguesAntes = 0;
    
    pedidosHojeAntes.forEach(p => {
      const valor = parseFloat(p.total) || 0;
      if (p.estado === 'saiu_para_entrega' || p.estado === 'entregue') {
        totalEntreguesAntes += valor;
      } else {
        totalProdutosAntes += valor;
      }
    });
    
    console.log(`Total Produtos (antes): R$ ${totalProdutosAntes.toFixed(2)}`);
    console.log(`Total Entregas (antes): R$ ${totalEntreguesAntes.toFixed(2)}`);
    console.log(`Pedidos existentes: ${pedidosHojeAntes.length}`);
    
    // Criar novo pedido de R$ 37
    console.log('\n=== CRIANDO NOVO PEDIDO ===');
    const novoPedido = {
      cliente: '5541999999999',
      itens: [
        {
          nome: 'Hambúrguer Teste',
          preco: 37.00,
          quantidade: 1
        }
      ],
      total: 37.00,
      estado: 'finalizado',
      endereco: 'Endereço Teste',
      observacoes: 'Pedido de teste R$ 37'
    };
    
    const resultado = clientService.adicionarPedido(novoPedido);
    if (resultado && resultado.id) {
      console.log('✓ Pedido adicionado:', resultado.id);
    } else {
      console.log('❌ Erro ao adicionar pedido, mas continuando análise...');
    }
    
    // Verificar totais depois do pedido
    console.log('\n=== TOTAIS DEPOIS DO PEDIDO ===');
    const pedidosDepois = clientService.obterPedidosPorEstado(null);
    const pedidosHojeDepois = pedidosDepois.filter(p => {
      if (!p.ts) return false;
      return new Date(p.ts).toDateString() === hoje;
    });
    
    let totalProdutosDepois = 0;
    let totalEntreguesDepois = 0;
    
    pedidosHojeDepois.forEach(p => {
      const valor = parseFloat(p.total) || 0;
      if (p.estado === 'saiu_para_entrega' || p.estado === 'entregue') {
        totalEntreguesDepois += valor;
      } else {
        totalProdutosDepois += valor;
      }
    });
    
    console.log(`Total Produtos (depois): R$ ${totalProdutosDepois.toFixed(2)}`);
    console.log(`Total Entregas (depois): R$ ${totalEntreguesDepois.toFixed(2)}`);
    console.log(`Pedidos totais: ${pedidosHojeDepois.length}`);
    
    // Calcular diferença
    const diferencaProdutos = totalProdutosDepois - totalProdutosAntes;
    const diferencaEntregas = totalEntreguesDepois - totalEntreguesAntes;
    
    console.log('\n=== ANÁLISE DA DIFERENÇA ===');
    console.log(`Diferença em Produtos: R$ ${diferencaProdutos.toFixed(2)}`);
    console.log(`Diferença em Entregas: R$ ${diferencaEntregas.toFixed(2)}`);
    
    if (diferencaProdutos === 37) {
      console.log('✅ SUCESSO: O pedido de R$ 37 foi adicionado corretamente aos produtos!');
    } else {
      console.log('❌ ERRO: O valor não foi adicionado corretamente.');
    }
    
    console.log('\n=== TESTE CONCLUÍDO ===');
    console.log('Acesse http://localhost:3001 para ver os totais atualizados no painel.');
    
  } catch (error) {
    console.error('Erro no teste:', error);
  }
}

testarPedido37();