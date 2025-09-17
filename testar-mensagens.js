const { mensagem } = require('./src/utils/mensagens');

console.log('🧪 Testando carregamento de mensagens...\n');

// Lista de mensagens para testar
const mensagensParaTestar = [
    'msgmenuInicialSub',
    'msgEnderecoConfirma',
    'msgApresentacao',
    'msgChavePix',
    'msgMenuBebidas',
    'msgMenuLanches',
    'msgMenuPorcoes'
];

console.log('📋 Testando mensagens específicas:');
mensagensParaTestar.forEach(chave => {
    const msg = mensagem[chave];
    const status = msg && !msg.includes('[Mensagem') ? '✅ ENCONTRADA' : '❌ NÃO ENCONTRADA';
    console.log(`${status} ${chave}: ${msg ? msg.substring(0, 50) : 'undefined'}${msg && msg.length > 50 ? '...' : ''}`);
});

console.log('\n🎯 Resultado do teste concluído!');