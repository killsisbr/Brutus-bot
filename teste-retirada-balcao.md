# Sistema de Retirada no Balcão - Teste

## Funcionalidades Implementadas

### 1. Configuração de Retirada no Balcão
- **Arquivo**: `src/utils/config.js`
- **Configuração**: `retiradaBalcaoConfig`
  - `habilitada: true/false` - Habilita ou desabilita a opção de retirada
  - `mensagem` - Mensagem exibida para o cliente escolher entre entrega e retirada

### 2. Novo Estado do Carrinho
- **Estado**: `menuEntregaRetirada: 'escolhendo_entrega_retirada'`
- **Arquivo**: `src/services/carrinhoService.js`

### 3. Menu de Escolha
- **Arquivo**: `src/core/fluxo/menuEntregaRetirada.js`
- **Opções**:
  - `1` ou `entrega` - Seleciona entrega (vai para menu de endereço)
  - `2` ou `retirada` - Seleciona retirada no balcão (pula para confirmação)

### 4. Fluxo Modificado
- **Arquivo**: `src/core/fluxo/menuGlobal.js`
- Quando cliente digita `F` (finalizar):
  - Se `retiradaBalcaoConfig.habilitada = true`: Mostra menu 1-Entrega / 2-Retirada
  - Se `retiradaBalcaoConfig.habilitada = false`: Continua fluxo normal (só entrega)

## Como Testar

### Teste 1: Com Retirada Habilitada
1. Adicione itens ao carrinho
2. Digite `F` para finalizar
3. Deve aparecer: "Digite 1 para Entrega ou 2 para Retirada no Balcão"
4. Digite `1` - vai para menu de endereço
5. Digite `2` - vai direto para confirmação (sem taxa de entrega)

### Teste 2: Com Retirada Desabilitada
1. Edite `src/utils/config.js` e mude `habilitada: false`
2. Reinicie o bot
3. Adicione itens ao carrinho
4. Digite `F` para finalizar
5. Deve ir direto para o menu de endereço (fluxo original)

## Configuração para Desabilitar

Para desabilitar a retirada no balcão, edite o arquivo `src/utils/config.js`:

```javascript
const retiradaBalcaoConfig = {
    habilitada: false, // Mude para false
    mensagem: "🚚 *Como você gostaria de receber seu pedido?*\n\n*1* - 🚚 Entrega\n*2* - 🏪 Retirada no Balcão\n\nDigite *1* ou *2*:"
};
```

## Estados do Carrinho

- **Entrega**: `entrega: true, retirada: false, valorEntrega: calculado`
- **Retirada**: `entrega: false, retirada: true, valorEntrega: 0`

## Arquivos Modificados

1. `src/utils/config.js` - Adicionada configuração
2. `src/services/carrinhoService.js` - Adicionado novo estado
3. `src/core/fluxo/menuGlobal.js` - Modificada lógica do "F"
4. `src/core/analisePorStatus.js` - Adicionado case para novo estado
5. `src/core/fluxo/menuEntregaRetirada.js` - Novo arquivo criado

## Sistema Funcionando ✅

O sistema está implementado e funcionando corretamente. A configuração permite habilitar/desabilitar a retirada no balcão conforme necessário.