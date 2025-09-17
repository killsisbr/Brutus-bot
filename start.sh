#!/bin/bash

# Script de inicialização do Brutus Bot
# Autor: Sistema Automatizado
# Descrição: Inicia o bot do restaurante com verificações de dependências

echo "🍔 Iniciando Brutus Bot - Sistema de Atendimento Automatizado"
echo "============================================================"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log colorido
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    log_error "Node.js não está instalado!"
    log_info "Instale o Node.js versão 16 ou superior:"
    log_info "curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -"
    log_info "sudo apt-get install -y nodejs"
    exit 1
fi

# Verificar versão do Node.js
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    log_error "Node.js versão $NODE_VERSION detectada. Versão 16+ é necessária!"
    exit 1
fi

log_success "Node.js $(node -v) detectado"

# Verificar se npm está instalado
if ! command -v npm &> /dev/null; then
    log_error "npm não está instalado!"
    exit 1
fi

log_success "npm $(npm -v) detectado"

# Verificar se o arquivo package.json existe
if [ ! -f "package.json" ]; then
    log_error "package.json não encontrado!"
    log_info "Certifique-se de estar no diretório correto do projeto"
    exit 1
fi

# Verificar se node_modules existe, se não, instalar dependências
if [ ! -d "node_modules" ]; then
    log_warning "Dependências não encontradas. Instalando..."
    npm install
    if [ $? -ne 0 ]; then
        log_error "Falha ao instalar dependências!"
        exit 1
    fi
    log_success "Dependências instaladas com sucesso"
else
    log_info "Dependências já instaladas"
fi

# Verificar se o arquivo bot.js existe
if [ ! -f "bot.js" ]; then
    log_error "bot.js não encontrado!"
    exit 1
fi

# Verificar se a porta 80 está disponível (requer sudo)
if [ "$EUID" -ne 0 ]; then
    log_warning "Para usar a porta 80, execute como root (sudo)"
    log_info "Alternativa: defina a variável PORT para uma porta > 1024"
    log_info "Exemplo: PORT=3000 ./start.sh"
fi

# Definir porta padrão se não especificada
if [ -z "$PORT" ]; then
    if [ "$EUID" -eq 0 ]; then
        export PORT=80
        log_info "Usando porta 80 (modo root)"
    else
        export PORT=3000
        log_info "Usando porta 3000 (modo usuário)"
    fi
else
    log_info "Usando porta $PORT (definida pelo usuário)"
fi

# Verificar se Chrome/Chromium está instalado (necessário para WhatsApp Web)
if ! command -v google-chrome &> /dev/null && ! command -v chromium-browser &> /dev/null && ! command -v chromium &> /dev/null; then
    log_warning "Chrome/Chromium não detectado!"
    log_info "Para WhatsApp Web, instale o Chrome:"
    log_info "wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | sudo apt-key add -"
    log_info "echo 'deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main' | sudo tee /etc/apt/sources.list.d/google-chrome.list"
    log_info "sudo apt update && sudo apt install google-chrome-stable"
else
    log_success "Navegador detectado para WhatsApp Web"
fi

# Criar diretórios necessários se não existirem
mkdir -p data
mkdir -p public

log_info "Verificando estrutura de diretórios..."
log_success "Estrutura verificada"

# Função para cleanup ao sair
cleanup() {
    log_info "Encerrando Brutus Bot..."
    exit 0
}

# Capturar sinais para cleanup
trap cleanup SIGINT SIGTERM

# Mostrar informações do sistema
echo ""
log_info "=== INFORMAÇÕES DO SISTEMA ==="
log_info "Node.js: $(node -v)"
log_info "npm: $(npm -v)"
log_info "Porta: $PORT"
log_info "Diretório: $(pwd)"
log_info "Usuário: $(whoami)"
echo ""

# Iniciar o bot
log_success "Iniciando Brutus Bot..."
echo ""
echo "🌐 URLs de Acesso:"
echo "   • Painel Principal: http://localhost:$PORT/pedidos.html"
echo "   • QR Code WhatsApp: http://localhost:$PORT/qrcode.html"
echo "   • Estatísticas: http://localhost:$PORT/estatisticas.html"
echo "   • Motoboy: http://localhost:$PORT/motoboy.html"
echo ""
echo "📱 Para parar o bot, pressione Ctrl+C"
echo "============================================================"
echo ""

# Executar o bot
node bot.js