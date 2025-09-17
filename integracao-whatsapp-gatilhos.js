const cardapioService = require('./src/services/cardapioService');
const carrinhoService = require('./src/services/carrinhoService');
const analisePalavras = require('./src/core/analisePalavras');

/**
 * Sistema de Integração WhatsApp com Gatilhos
 * Permite adicionar itens ao carrinho via mensagens do WhatsApp
 */
class IntegracaoWhatsAppGatilhos {
    constructor() {
        this.cardapioService = cardapioService;
        this.carrinhoService = carrinhoService;
        this.analisePalavras = analisePalavras;
        this.initialized = false;
    }

    async inicializar() {
        try {
            console.log('🚀 Inicializando integração WhatsApp com gatilhos...');
            
            // Inicializar serviços
            await this.cardapioService.init();
            console.log('✅ CardapioService inicializado');
            
            this.initialized = true;
            console.log('✅ Integração WhatsApp inicializada com sucesso!');
            
            return true;
        } catch (error) {
            console.error('❌ Erro ao inicializar integração WhatsApp:', error);
            return false;
        }
    }

    /**
     * Processa mensagem do WhatsApp e tenta adicionar item ao carrinho
     * @param {string} mensagem - Mensagem recebida do WhatsApp
     * @param {string} clienteId - ID do cliente
     * @returns {Object} Resultado do processamento
     */
    async processarMensagem(mensagem, clienteId) {
        try {
            if (!this.initialized) {
                await this.inicializar();
            }

            console.log(`📱 Processando mensagem: "${mensagem}" do cliente: ${clienteId}`);

            // Normalizar mensagem
            const mensagemNormalizada = this.normalizarTexto(mensagem);
            
            // Tentar reconhecer item através dos gatilhos
            const itemReconhecido = await this.reconhecerItem(mensagemNormalizada);
            
            if (!itemReconhecido) {
                return {
                    sucesso: false,
                    tipo: 'item_nao_reconhecido',
                    mensagem: 'Não consegui identificar esse item no cardápio. Tente usar o nome completo ou uma variação conhecida.',
                    sugestoes: await this.obterSugestoes(mensagemNormalizada)
                };
            }

            // Adicionar item ao carrinho
            const resultadoCarrinho = await this.adicionarAoCarrinho(itemReconhecido, clienteId);
            
            if (resultadoCarrinho.sucesso) {
                return {
                    sucesso: true,
                    tipo: 'item_adicionado',
                    item: itemReconhecido,
                    mensagem: `✅ ${itemReconhecido.nome} adicionado ao carrinho!\n💰 Preço: R$ ${itemReconhecido.preco.toFixed(2)}`,
                    carrinho: resultadoCarrinho.carrinho
                };
            } else {
                return {
                    sucesso: false,
                    tipo: 'erro_carrinho',
                    mensagem: `❌ Erro ao adicionar ${itemReconhecido.nome} ao carrinho: ${resultadoCarrinho.erro}`,
                    item: itemReconhecido
                };
            }

        } catch (error) {
            console.error('❌ Erro ao processar mensagem WhatsApp:', error);
            return {
                sucesso: false,
                tipo: 'erro_sistema',
                mensagem: 'Ops! Ocorreu um erro interno. Tente novamente em alguns instantes.',
                erro: error.message
            };
        }
    }

    /**
     * Reconhece item através dos gatilhos configurados
     * @param {string} texto - Texto normalizado
     * @returns {Object|null} Item reconhecido ou null
     */
    async reconhecerItem(texto) {
        try {
            // Usar o sistema de análise de palavras existente
            // Como analisarPalavras não tem método analisarTexto, vamos usar busca direta
            const items = this.cardapioService.getItems();
            
            // Buscar por nome exato primeiro
            let item = items.find(i => this.normalizarTexto(i.nome) === texto);
            if (item) return item;

            // Fallback: busca direta nos mappings
            const mappings = this.cardapioService.getMappings();
            const itemIdDireto = mappings[texto];
            
            if (itemIdDireto) {
                const items = this.cardapioService.getItems();
                const item = items.find(i => i.id === itemIdDireto);
                return item || null;
            }

            return null;
        } catch (error) {
            console.error('Erro ao reconhecer item:', error);
            return null;
        }
    }

    /**
     * Adiciona item ao carrinho do cliente
     * @param {Object} item - Item a ser adicionado
     * @param {string} clienteId - ID do cliente
     * @returns {Object} Resultado da operação
     */
    async adicionarAoCarrinho(item, clienteId) {
        try {
            // Inicializar carrinho se necessário
            let carrinho = this.carrinhoService.getCarrinho(clienteId);
            if (!carrinho) {
                this.carrinhoService.inicializarCarrinho(clienteId);
                carrinho = this.carrinhoService.getCarrinho(clienteId);
            }

            // Adicionar item ao carrinho
            const resultado = await this.carrinhoService.adicionarItemAoCarrinho(
                clienteId,
                item.id,
                1 // quantidade padrão
            );

            console.log(`✅ Item ${item.nome} adicionado ao carrinho do cliente ${clienteId}`);
            return {
                sucesso: true,
                carrinho: this.carrinhoService.getCarrinho(clienteId)
            };

        } catch (error) {
            console.error('Erro ao adicionar ao carrinho:', error);
            return {
                sucesso: false,
                erro: error.message
            };
        }
    }

    /**
     * Obtém sugestões de itens similares
     * @param {string} texto - Texto da busca
     * @returns {Array} Lista de sugestões
     */
    async obterSugestoes(texto) {
        try {
            const items = this.cardapioService.getItems();
            const sugestoes = [];

            // Buscar itens que contenham parte do texto
            items.forEach(item => {
                const nomeNormalizado = this.normalizarTexto(item.nome);
                if (nomeNormalizado.includes(texto) || texto.includes(nomeNormalizado)) {
                    sugestoes.push({
                        nome: item.nome,
                        preco: item.preco,
                        id: item.id
                    });
                }
            });

            // Limitar a 5 sugestões
            return sugestoes.slice(0, 5);
        } catch (error) {
            console.error('Erro ao obter sugestões:', error);
            return [];
        }
    }

    /**
     * Normaliza texto para comparação
     * @param {string} texto - Texto a ser normalizado
     * @returns {string} Texto normalizado
     */
    normalizarTexto(texto) {
        return texto
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove acentos
            .replace(/[^a-z0-9\s]/g, '') // Remove caracteres especiais
            .replace(/\s+/g, ' ') // Normaliza espaços
            .trim();
    }

    /**
     * Lista todos os gatilhos disponíveis
     * @returns {Object} Mapeamento de gatilhos para itens
     */
    listarGatilhos() {
        try {
            const mappings = this.cardapioService.getMappings();
            const items = this.cardapioService.getItems();
            const gatilhosPorItem = {};

            // Organizar gatilhos por item
            Object.entries(mappings).forEach(([gatilho, itemId]) => {
                const item = items.find(i => i.id === itemId);
                if (item) {
                    if (!gatilhosPorItem[item.nome]) {
                        gatilhosPorItem[item.nome] = {
                            id: item.id,
                            preco: item.preco,
                            gatilhos: []
                        };
                    }
                    gatilhosPorItem[item.nome].gatilhos.push(gatilho);
                }
            });

            return gatilhosPorItem;
        } catch (error) {
            console.error('Erro ao listar gatilhos:', error);
            return {};
        }
    }

    /**
     * Testa o reconhecimento de um gatilho específico
     * @param {string} gatilho - Gatilho a ser testado
     * @returns {Object} Resultado do teste
     */
    async testarGatilho(gatilho) {
        try {
            const item = await this.reconhecerItem(this.normalizarTexto(gatilho));
            
            return {
                gatilho: gatilho,
                reconhecido: !!item,
                item: item,
                mensagem: item 
                    ? `✅ Gatilho "${gatilho}" reconhece: ${item.nome} (R$ ${item.preco.toFixed(2)})`
                    : `❌ Gatilho "${gatilho}" não foi reconhecido`
            };
        } catch (error) {
            return {
                gatilho: gatilho,
                reconhecido: false,
                erro: error.message,
                mensagem: `❌ Erro ao testar gatilho "${gatilho}": ${error.message}`
            };
        }
    }
}

// Função de demonstração
async function demonstrarIntegracao() {
    console.log('🎯 === DEMONSTRAÇÃO INTEGRAÇÃO WHATSAPP ===\n');
    
    const integracao = new IntegracaoWhatsAppGatilhos();
    await integracao.inicializar();
    
    // Simular mensagens do WhatsApp
    const mensagensTeste = [
        'quero um x-mega',
        'coca cola',
        'batata frita',
        'hamburguer',
        'item inexistente'
    ];
    
    const clienteId = 'cliente_teste_123';
    
    console.log('📱 Testando mensagens do WhatsApp:\n');
    
    for (const mensagem of mensagensTeste) {
        console.log(`\n🔍 Mensagem: "${mensagem}"`);
        const resultado = await integracao.processarMensagem(mensagem, clienteId);
        console.log(`📋 Resultado: ${resultado.mensagem}`);
        
        if (resultado.sugestoes && resultado.sugestoes.length > 0) {
            console.log('💡 Sugestões:', resultado.sugestoes.map(s => s.nome).join(', '));
        }
    }
    
    // Mostrar carrinho final
    console.log('\n🛒 Carrinho final:');
    const carrinho = integracao.carrinhoService.getCarrinho(clienteId);
    if (carrinho && carrinho.carrinho && carrinho.carrinho.length > 0) {
        carrinho.carrinho.forEach(item => {
            console.log(`  - ${item.nome} x${item.quantidade} = R$ ${(item.preco * item.quantidade).toFixed(2)}`);
        });
        const total = integracao.carrinhoService.valorTotal(clienteId);
        console.log(`💰 Total: R$ ${total.toFixed(2)}`);
    } else {
        console.log('  Carrinho vazio');
    }
    
    console.log('\n✅ Demonstração concluída!');
}

// Exportar classe e função de demonstração
module.exports = {
    IntegracaoWhatsAppGatilhos,
    demonstrarIntegracao
};

// Executar demonstração se chamado diretamente
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.includes('--demo')) {
        demonstrarIntegracao().catch(console.error);
    } else if (args.includes('--testar') && args[1]) {
        // Testar gatilho específico
        (async () => {
            const integracao = new IntegracaoWhatsAppGatilhos();
            await integracao.inicializar();
            
            const gatilho = args[args.indexOf('--testar') + 1];
            const resultado = await integracao.testarGatilho(gatilho);
            console.log(resultado.mensagem);
        })().catch(console.error);
    } else if (args.includes('--listar')) {
        // Listar todos os gatilhos
        (async () => {
            const integracao = new IntegracaoWhatsAppGatilhos();
            await integracao.inicializar();
            
            const gatilhos = integracao.listarGatilhos();
            console.log('🎯 Gatilhos disponíveis:\n');
            
            Object.entries(gatilhos).forEach(([nomeItem, dados]) => {
                console.log(`📦 ${nomeItem} (ID: ${dados.id}, R$ ${dados.preco.toFixed(2)})`);
                console.log(`   Gatilhos: ${dados.gatilhos.join(', ')}\n`);
            });
        })().catch(console.error);
    } else {
        console.log(`
🎯 Sistema de Integração WhatsApp com Gatilhos

Uso:
  node integracao-whatsapp-gatilhos.js --demo          # Executar demonstração
  node integracao-whatsapp-gatilhos.js --testar <gatilho>  # Testar gatilho específico
  node integracao-whatsapp-gatilhos.js --listar       # Listar todos os gatilhos

Exemplos:
  node integracao-whatsapp-gatilhos.js --demo
  node integracao-whatsapp-gatilhos.js --testar "x-mega"
  node integracao-whatsapp-gatilhos.js --listar
`);
    }
}