# 🐧 Brutus Bot - Configuração para Linux

Este guia explica como configurar e executar o Brutus Bot em sistemas Linux.

## 📋 Pré-requisitos

### 1. Node.js (versão 16 ou superior)
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS/RHEL/Fedora
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo dnf install nodejs npm

# Arch Linux
sudo pacman -S nodejs npm
```

### 2. Google Chrome (para WhatsApp Web)
```bash
# Ubuntu/Debian
wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
echo 'deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main' | sudo tee /etc/apt/sources.list.d/google-chrome.list
sudo apt update && sudo apt install google-chrome-stable

# Fedora
sudo dnf install google-chrome-stable

# Arch Linux
yay -S google-chrome
```

### 3. Dependências do sistema
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y git curl wget build-essential

# CentOS/RHEL/Fedora
sudo dnf groupinstall "Development Tools"
sudo dnf install git curl wget

# Arch Linux
sudo pacman -S git curl wget base-devel
```

## 🚀 Instalação e Configuração

### 1. Clone o repositório (se necessário)
```bash
git clone <url-do-repositorio>
cd Brutus-bot
```

### 2. Torne o script executável
```bash
chmod +x start.sh
```

### 3. Instale as dependências
```bash
npm install
```

## 🎯 Execução

### Opção 1: Script Automatizado (Recomendado)
```bash
# Execução normal (porta 3000)
./start.sh

# Execução como root (porta 80)
sudo ./start.sh

# Execução com porta customizada
PORT=8080 ./start.sh
```

### Opção 2: Execução Manual
```bash
# Porta padrão (3000)
node bot.js

# Porta customizada
PORT=8080 node bot.js

# Porta 80 (requer root)
sudo PORT=80 node bot.js
```

## 🌐 URLs de Acesso

Após iniciar o bot, acesse:

- **Painel Principal:** `http://localhost:PORT/pedidos.html`
- **QR Code WhatsApp:** `http://localhost:PORT/qrcode.html`
- **Estatísticas:** `http://localhost:PORT/estatisticas.html`
- **Motoboy:** `http://localhost:PORT/motoboy.html`

*Substitua `PORT` pela porta configurada (padrão: 3000)*

## 🔧 Configurações Avançadas

### Variáveis de Ambiente
```bash
# Definir porta
export PORT=3000

# Definir porta do dashboard (se diferente)
export DASHBOARD_PORT=3000

# Modo de desenvolvimento
export NODE_ENV=development
```

### Execução como Serviço (systemd)

1. Crie o arquivo de serviço:
```bash
sudo nano /etc/systemd/system/brutus-bot.service
```

2. Adicione o conteúdo:
```ini
[Unit]
Description=Brutus Bot - Sistema de Atendimento
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/caminho/para/Brutus-bot
ExecStart=/usr/bin/node bot.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=80

[Install]
WantedBy=multi-user.target
```

3. Ative e inicie o serviço:
```bash
sudo systemctl daemon-reload
sudo systemctl enable brutus-bot
sudo systemctl start brutus-bot
```

### Configuração com PM2 (Recomendado para produção)

1. Instale o PM2:
```bash
sudo npm install -g pm2
```

2. Crie arquivo de configuração `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'brutus-bot',
    script: 'bot.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 80
    }
  }]
}
```

3. Inicie com PM2:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 🔍 Solução de Problemas

### Erro de Permissão na Porta 80
```bash
# Solução 1: Execute como root
sudo ./start.sh

# Solução 2: Use uma porta > 1024
PORT=3000 ./start.sh

# Solução 3: Configure iptables para redirecionamento
sudo iptables -t nat -A PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 3000
```

### Chrome não encontrado
```bash
# Instale o Chrome conforme instruções acima
# Ou configure o caminho manualmente
export CHROME_BIN=/usr/bin/google-chrome
```

### Problemas de dependências
```bash
# Limpe o cache e reinstale
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Verificar logs
```bash
# Com PM2
pm2 logs brutus-bot

# Com systemd
sudo journalctl -u brutus-bot -f

# Execução manual
node bot.js 2>&1 | tee bot.log
```

## 📊 Monitoramento

### Com PM2
```bash
pm2 status          # Status dos processos
pm2 monit           # Monitor em tempo real
pm2 logs            # Visualizar logs
pm2 restart all     # Reiniciar todos os processos
```

### Logs do Sistema
```bash
# Logs em tempo real
tail -f /var/log/syslog | grep brutus

# Logs do serviço
sudo journalctl -u brutus-bot -f
```

## 🔒 Segurança

### Firewall (UFW)
```bash
# Permitir porta específica
sudo ufw allow 3000/tcp

# Permitir apenas de IPs específicos
sudo ufw allow from 192.168.1.0/24 to any port 3000
```

### Proxy Reverso com Nginx
```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📞 Suporte

Para problemas específicos do Linux:

1. Verifique os logs: `./start.sh` mostra informações detalhadas
2. Confirme as dependências: Node.js 16+, Chrome instalado
3. Verifique permissões: arquivos executáveis e portas disponíveis
4. Teste conectividade: WhatsApp Web requer conexão estável

---

**Desenvolvido para sistemas Linux** 🐧