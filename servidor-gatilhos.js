const express = require('express');
const path = require('path');
const fs = require('fs');

// Importar serviços existentes
const cardapioService = require('./src/services/cardapioService');

const app = express();
const PORT = 3001;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Adaptador para simular wordRecognitionService usando cardapioService
const wordRecognitionAdapter = {
    async obterTodosMappings() {
        await cardapioService.init();
        return cardapioService.getMappings();
    },
    
    async obterIdPorPalavra(palavra) {
        await cardapioService.init();
        const mappings = cardapioService.getMappings();
        return mappings[palavra] || null;
    },
    
    async adicionarMapping(palavra, itemId) {
        await cardapioService.init();
        return cardapioService.addMapping(palavra, itemId);
    },
    
    async atualizarIdMappings(idAntigo, novoId) {
        await cardapioService.init();
        const mappings = cardapioService.getMappings();
        let atualizados = 0;
        
        // Encontrar todos os mappings que apontam para o ID antigo
        for (const [palavra, itemId] of Object.entries(mappings)) {
            if (itemId === idAntigo) {
                // Remover mapping antigo
                cardapioService.removeMapping(palavra);
                // Adicionar mapping com novo ID
                cardapioService.addMapping(palavra, novoId);
                atualizados++;
            }
        }
        
        return atualizados;
    },
    
    getTriggersForItem(itemId) {
        try {
            // Obter todos os gatilhos para um item específico
            const mappings = cardapioService.getMappings();
            const gatilhos = [];
            
            // Encontrar todos os mappings que apontam para este item
            for (const [palavra, id] of Object.entries(mappings)) {
                if (id === itemId) {
                    gatilhos.push(palavra);
                }
            }
            
            return gatilhos;
        } catch (error) {
            console.error('Erro ao obter gatilhos do item:', error);
            return [];
        }
    }
};

// Adaptador para cardapioService
const cardapioAdapter = {
    getItems() {
        try {
            return cardapioService.getItems();
        } catch (error) {
            console.error('Erro ao obter itens:', error);
            return [];
        }
    },
    
    getItemById(id) {
        try {
            const items = cardapioService.getItems();
            return items.find(item => item.id === id) || null;
        } catch (error) {
            console.error('Erro ao obter item por ID:', error);
            return null;
        }
    },
    
    async obterTodosItens() {
        await cardapioService.init();
        return cardapioService.getItems();
    },
    
    async obterItemPorId(id) {
        await cardapioService.init();
        const itens = cardapioService.getItems();
        return itens.find(item => item.id === id) || null;
    },
    
    async alterarIdItem(idAntigo, novoId) {
        await cardapioService.init();
        const item = await this.obterItemPorId(idAntigo);
        if (!item) return false;
        
        try {
            // Remover item antigo
            cardapioService.removeItem(idAntigo);
            // Adicionar item com novo ID
            cardapioService.addItem({
                id: novoId,
                nome: item.nome,
                descricao: item.descricao,
                preco: item.preco,
                tipo: item.tipo
            });
            return true;
        } catch (error) {
            console.error('Erro ao alterar ID:', error);
            return false;
        }
    }
};

// Função para normalizar texto
function normalizarTexto(texto) {
    return texto.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '');
}

// Função para gerar variações de gatilhos
function gerarVariacoes(nome) {
    const variações = new Set();
    const nomeNormalizado = normalizarTexto(nome);
    
    // Adicionar nome original normalizado
    variações.add(nomeNormalizado);
    
    // Remover prefixos comuns
    const prefixos = ['x-', 'x', 'lanche', 'hamburguer', 'burger'];
    prefixos.forEach(prefixo => {
        if (nomeNormalizado.startsWith(prefixo)) {
            const semPrefixo = nomeNormalizado.substring(prefixo.length);
            if (semPrefixo.length > 2) {
                variações.add(semPrefixo);
            }
        }
    });
    
    // Adicionar versões com espaços
    const comEspaco = nome.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    
    if (comEspaco !== nomeNormalizado) {
        variações.add(comEspaco.replace(/\s/g, ''));
        variações.add(comEspaco.replace(/\s/g, '-'));
        variações.add(comEspaco);
    }
    
    // Adicionar palavras-chave importantes
    const palavras = comEspaco.split(/[\s-]+/).filter(p => p.length > 2);
    if (palavras.length > 1) {
        // Primeira e última palavra
        variações.add(palavras[0] + palavras[palavras.length - 1]);
        
        // Palavras importantes
        const importantes = palavras.filter(p => 
            !['de', 'da', 'do', 'com', 'e', 'ou', 'a', 'o'].includes(p)
        );
        
        if (importantes.length > 0) {
            variações.add(importantes.join(''));
            if (importantes.length > 1) {
                variações.add(importantes[0]);
                variações.add(importantes[importantes.length - 1]);
            }
        }
    }
    
    return Array.from(variações).filter(v => v.length >= 2);
}

// Rota principal - servir a interface
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'visualizacao-cardapio.html'));
});

// Rota para gerenciar gatilhos (página antiga)
app.get('/gerenciar', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'gerenciar-gatilhos.html'));
});

// API: Obter cardápio e mappings
app.get('/api/cardapio', async (req, res) => {
    try {
        const itens = await cardapioAdapter.obterTodosItens();
        const mappings = await wordRecognitionAdapter.obterTodosMappings();
        
        // Adicionar gatilhos para cada item
        const itensComGatilhos = itens.map(item => {
            const gatilhos = Object.keys(mappings).filter(palavra => mappings[palavra] === item.id);
            return {
                ...item,
                gatilhos: gatilhos
            };
        });
        
        res.json({
            success: true,
            itens: itensComGatilhos,
            mappings: mappings
        });
    } catch (error) {
        console.error('Erro ao obter cardápio:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao carregar cardápio'
        });
    }
});

// API: Adicionar gatilho único
app.post('/api/gatilhos', async (req, res) => {
    try {
        const { gatilho, itemId } = req.body;
        
        if (!gatilho || !itemId) {
            return res.status(400).json({
                success: false,
                message: 'Gatilho e ID do item são obrigatórios'
            });
        }
        
        // Verificar se o item existe
        const item = await cardapioAdapter.obterItemPorId(itemId);
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item não encontrado'
            });
        }
        
        // Normalizar gatilho
        const gatilhoNormalizado = normalizarTexto(gatilho);
        
        // Verificar se o gatilho já existe
        const mappingExistente = await wordRecognitionAdapter.obterIdPorPalavra(gatilhoNormalizado);
        if (mappingExistente && mappingExistente !== itemId) {
            return res.status(400).json({
                success: false,
                message: `Gatilho "${gatilho}" já está sendo usado pelo item ID ${mappingExistente}`
            });
        }
        
        // Adicionar mapping
        await wordRecognitionAdapter.adicionarMapping(gatilhoNormalizado, itemId);
        
        res.json({
            success: true,
            message: `Gatilho "${gatilho}" adicionado com sucesso`,
            gatilho: gatilhoNormalizado,
            itemId: itemId
        });
        
    } catch (error) {
        console.error('Erro ao adicionar gatilho:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// API: Adicionar múltiplos gatilhos
app.post('/api/gatilhos/multiplos', async (req, res) => {
    try {
        const { gatilhos, itemId } = req.body;
        
        if (!gatilhos || !Array.isArray(gatilhos) || !itemId) {
            return res.status(400).json({
                success: false,
                message: 'Lista de gatilhos e ID do item são obrigatórios'
            });
        }
        
        // Verificar se o item existe
        const item = await cardapioAdapter.obterItemPorId(itemId);
        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Item não encontrado'
            });
        }
        
        let adicionados = 0;
        const conflitos = [];
        
        for (const gatilho of gatilhos) {
            const gatilhoNormalizado = normalizarTexto(gatilho);
            
            // Verificar conflitos
            const mappingExistente = await wordRecognitionAdapter.obterIdPorPalavra(gatilhoNormalizado);
            if (mappingExistente && mappingExistente !== itemId) {
                conflitos.push(`"${gatilho}" (já usado pelo item ${mappingExistente})`);
                continue;
            }
            
            // Adicionar mapping
            await wordRecognitionAdapter.adicionarMapping(gatilhoNormalizado, itemId);
            adicionados++;
        }
        
        let message = `${adicionados} gatilhos adicionados com sucesso`;
        if (conflitos.length > 0) {
            message += `. Conflitos ignorados: ${conflitos.join(', ')}`;
        }
        
        res.json({
            success: true,
            message: message,
            adicionados: adicionados,
            conflitos: conflitos.length
        });
        
    } catch (error) {
        console.error('Erro ao adicionar gatilhos múltiplos:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// API: Alterar ID do item
app.post('/api/alterar-id', async (req, res) => {
    try {
        const { itemIdAtual, novoId } = req.body;
        
        if (!itemIdAtual || !novoId) {
            return res.status(400).json({
                success: false,
                message: 'ID atual e novo ID são obrigatórios'
            });
        }
        
        // Verificar se o item atual existe
        const itemAtual = await cardapioAdapter.obterItemPorId(itemIdAtual);
        if (!itemAtual) {
            return res.status(404).json({
                success: false,
                message: 'Item atual não encontrado'
            });
        }
        
        // Verificar se o novo ID já existe
        const itemExistente = await cardapioAdapter.obterItemPorId(novoId);
        if (itemExistente) {
            return res.status(400).json({
                success: false,
                message: `Já existe um item com ID ${novoId}`
            });
        }
        
        // Alterar ID no cardápio
        const sucesso = await cardapioAdapter.alterarIdItem(itemIdAtual, novoId);
        if (!sucesso) {
            return res.status(500).json({
                success: false,
                message: 'Erro ao alterar ID no cardápio'
            });
        }
        
        // Atualizar todos os mappings
        const gatilhosAtualizados = await wordRecognitionAdapter.atualizarIdMappings(itemIdAtual, novoId);
        
        res.json({
            success: true,
            message: `ID alterado de ${itemIdAtual} para ${novoId}`,
            gatilhosAtualizados: gatilhosAtualizados
        });
        
    } catch (error) {
        console.error('Erro ao alterar ID:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// API: Gerar gatilhos automáticos
app.post('/api/gatilhos/automaticos', async (req, res) => {
    try {
        const itens = await cardapioAdapter.obterTodosItens();
        const mappingsExistentes = await wordRecognitionAdapter.obterTodosMappings();
        
        let gatilhosGerados = 0;
        
        for (const item of itens) {
            // Verificar se o item já tem gatilhos
            const temGatilhos = Object.values(mappingsExistentes).includes(item.id);
            
            if (!temGatilhos) {
                // Gerar variações automáticas
                const variacoes = gerarVariacoes(item.nome);
                
                for (const variacao of variacoes) {
                    // Verificar se a variação já existe
                    const mappingExistente = await wordRecognitionAdapter.obterIdPorPalavra(variacao);
                    if (!mappingExistente) {
                        await wordRecognitionAdapter.adicionarMapping(variacao, item.id);
                        gatilhosGerados++;
                    }
                }
            }
        }
        
        res.json({
            success: true,
            message: `${gatilhosGerados} gatilhos automáticos gerados`,
            gatilhosGerados: gatilhosGerados
        });
        
    } catch (error) {
        console.error('Erro ao gerar gatilhos automáticos:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor'
        });
    }
});

// API para adicionar gatilho individual
app.post('/api/gatilhos/adicionar', async (req, res) => {
    try {
        const { itemId, gatilho } = req.body;
        
        if (!itemId || !gatilho) {
            return res.status(400).json({ error: 'ItemId e gatilho são obrigatórios' });
        }
        
        // Verificar se o item existe
        const item = await cardapioAdapter.obterItemPorId(itemId);
        if (!item) {
            return res.status(404).json({ error: 'Item não encontrado' });
        }
        
        // Adicionar o gatilho
        await wordRecognitionAdapter.adicionarMapping(normalizarTexto(gatilho), itemId);
        
        res.json({
            success: true,
            message: `Gatilho "${gatilho}" adicionado para o item "${item.nome}"`,
            itemId: itemId,
            gatilho: gatilho
        });
    } catch (error) {
        console.error('Erro ao adicionar gatilho:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// API para remover gatilho
app.post('/api/gatilhos/remover', async (req, res) => {
    try {
        const { itemId, gatilho } = req.body;
        
        if (!itemId || !gatilho) {
            return res.status(400).json({ error: 'ItemId e gatilho são obrigatórios' });
        }
        
        // Verificar se o item existe
        const item = await cardapioAdapter.obterItemPorId(itemId);
        if (!item) {
            return res.status(404).json({ error: 'Item não encontrado' });
        }
        
        // Remover o gatilho
        cardapioService.removeMapping(normalizarTexto(gatilho));
        
        res.json({
            success: true,
            message: `Gatilho "${gatilho}" removido do item "${item.nome}"`,
            itemId: itemId,
            gatilho: gatilho
        });
    } catch (error) {
        console.error('Erro ao remover gatilho:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// API para testar WhatsApp
app.post('/api/whatsapp/testar', async (req, res) => {
    try {
        const { itemId } = req.body;
        
        if (!itemId) {
            return res.status(400).json({ error: 'ItemId é obrigatório' });
        }
        
        // Verificar se o item existe
        const item = await cardapioAdapter.obterItemPorId(itemId);
        if (!item) {
            return res.status(404).json({ error: 'Item não encontrado' });
        }
        
        // Obter gatilhos do item
        const mappings = await wordRecognitionAdapter.obterTodosMappings();
        const gatilhos = Object.keys(mappings).filter(palavra => mappings[palavra] === itemId);
        
        res.json({
            success: true,
            item: item.nome,
            status: 'Teste realizado com sucesso',
            mensagem: `Item "${item.nome}" pode ser adicionado ao carrinho via WhatsApp usando os gatilhos: ${gatilhos.join(', ')}`,
            gatilhos: gatilhos,
            preco: item.preco
        });
    } catch (error) {
        console.error('Erro ao testar WhatsApp:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// API para testar gatilho específico
app.post('/api/testar-gatilho', async (req, res) => {
    try {
        const { palavra } = req.body;
        
        if (!palavra) {
            return res.status(400).json({ error: 'Palavra é obrigatória' });
        }
        
        const itemId = await wordRecognitionAdapter.obterIdPorPalavra(normalizarTexto(palavra));
        const item = itemId ? await cardapioAdapter.obterItemPorId(itemId) : null;
        
        res.json({
            success: true,
            palavra: palavra,
            itemId: itemId,
            item: item,
            encontrado: !!item
        });
    } catch (error) {
        console.error('Erro ao testar gatilho:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// Inicializar servidor
app.listen(PORT, async () => {
    // Inicializar cardapioService
    try {
        await cardapioService.init();
        console.log('✅ CardapioService inicializado');
    } catch (error) {
        console.error('❌ Erro ao inicializar CardapioService:', error);
    }
    
    console.log(`\n🚀 Servidor de Gatilhos iniciado!`);
    console.log(`📱 Interface: http://localhost:${PORT}`);
    console.log(`🔧 API: http://localhost:${PORT}/api`);
    console.log(`\n💡 Funcionalidades disponíveis:`);
    console.log(`   • Adicionar gatilhos individuais`);
    console.log(`   • Adicionar múltiplos gatilhos`);
    console.log(`   • Alterar IDs dos itens`);
    console.log(`   • Gerar gatilhos automáticos`);
    console.log(`   • Visualizar todos os itens e gatilhos`);
    console.log(`\n⚡ Pronto para uso!\n`);
});

// Tratamento de erros
process.on('uncaughtException', (error) => {
    console.error('Erro não capturado:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Promise rejeitada:', reason);
});

module.exports = app;