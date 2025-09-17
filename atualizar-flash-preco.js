const cardapioService = require('./src/services/cardapioService');

async function atualizarFlashPreco() {
  console.log('=== Atualizando preço do Flash ===');
  
  try {
    // Inicializar o serviço
    await cardapioService.init();
    
    // Verificar item Flash atual
    const mappings = cardapioService.getMappings();
    const flashId = mappings['flash'];
    
    if (!flashId) {
      console.log('Item Flash não encontrado nos mapeamentos.');
      return;
    }
    
    const items = cardapioService.getItems();
    const flashItem = items.find(item => item.id === flashId);
    
    if (!flashItem) {
      console.log(`Item Flash com ID ${flashId} não encontrado.`);
      return;
    }
    
    console.log(`Flash atual: ID ${flashItem.id}, Nome: ${flashItem.nome}, Preço: R$ ${flashItem.preco.toFixed(2)}`);
    
    // Remover item antigo
    cardapioService.removeItem(flashId);
    console.log('Item Flash antigo removido.');
    
    // Adicionar novo item com preço atualizado (baseado nas imagens - assumindo R$ 28,00)
    const novoId = cardapioService.addItem({
      nome: 'Flash',
      descricao: 'Lanche especial Flash',
      preco: 28.00,
      tipo: 'Lanche'
    });
    
    if (novoId) {
      console.log(`Novo Flash criado com ID ${novoId} e preço R$ 28,00`);
      
      // Atualizar mapeamento
      cardapioService.addMapping('flash', novoId);
      console.log('Mapeamento atualizado.');
      
      // Verificar resultado
      const novosItems = cardapioService.getItems();
      const novoFlash = novosItems.find(item => item.id === novoId);
      console.log(`Verificação: ID ${novoFlash.id}, Nome: ${novoFlash.nome}, Preço: R$ ${novoFlash.preco.toFixed(2)}`);
    } else {
      console.log('Erro ao criar novo item Flash.');
    }
    
  } catch (error) {
    console.error('Erro ao atualizar Flash:', error);
  }
}

atualizarFlashPreco();