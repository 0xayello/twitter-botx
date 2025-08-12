# Deploy na Vercel - Bot Twitter MVRV

## 🚀 Deploy Automático

### 1. Conectar Repositório GitHub
1. Acesse [vercel.com](https://vercel.com)
2. Faça login com sua conta GitHub
3. Clique em "New Project"
4. Selecione o repositório `twitter-botx`
5. Clique em "Import"

### 2. Configuração do Projeto
- **Framework Preset**: Next.js
- **Root Directory**: `./` (padrão)
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

### 3. Variáveis de Ambiente
Configure as seguintes variáveis no painel da Vercel:

```bash
# Twitter API
TWITTER_API_KEY=sua_api_key_aqui
TWITTER_API_SECRET=sua_api_secret_aqui
TWITTER_ACCESS_TOKEN=sua_access_token_aqui
TWITTER_ACCESS_SECRET=sua_access_secret_aqui

# Coinmetrics API
COINMETRICS_API_KEY=sua_api_key_aqui

# Outras configurações
NODE_ENV=production
```

### 4. Deploy
1. Clique em "Deploy"
2. Aguarde o build completar
3. Anote a URL do projeto (ex: `https://twitter-botx.vercel.app`)

## 🧪 Testes Pós-Deploy

### 1. Health Check
```bash
curl https://seu-projeto.vercel.app/api/health
```

**Resposta esperada:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-XX...",
  "environment": "production",
  "version": "1.0.0",
  "services": {
    "chart": "available",
    "twitter": "available",
    "coinmetrics": "available",
    "coingecko": "available"
  },
  "chartjs": {
    "version": "3.9.1",
    "status": "configured"
  }
}
```

### 2. Teste de Geração de Gráfico
```bash
curl -o test-chart.png https://seu-projeto.vercel.app/api/test-chart
```

**Verificar:**
- ✅ Arquivo `test-chart.png` foi baixado
- ✅ Imagem contém título "Bitcoin MVRV - Últimos 180 dias"
- ✅ Eixos X e Y com valores
- ✅ Zonas coloridas (vermelho, laranja, amarelo, verde)
- ✅ Linha azul do MVRV

### 3. Teste Manual do Cron
```bash
curl -X POST https://seu-projeto.vercel.app/api/cron
```

**Verificar logs na Vercel:**
- Acesse o projeto no painel da Vercel
- Vá em "Functions" → "cron"
- Verifique os logs de execução

## 🔧 Troubleshooting

### Problema: Build falha
**Solução:**
```bash
# Verificar dependências
npm install

# Build local para testar
npm run build
```

### Problema: Gráfico sem fontes
**Solução:**
1. Verificar se Chart.js v3.9.1 está instalado
2. Verificar se `chart-config.ts` está sendo importado
3. Verificar logs de erro na Vercel

### Problema: API retorna erro 500
**Solução:**
1. Verificar variáveis de ambiente
2. Verificar logs na Vercel
3. Testar endpoint `/api/health` primeiro

## 📊 Monitoramento

### 1. Logs da Vercel
- Acesse o projeto no painel
- Vá em "Functions" → "View Function Logs"

### 2. Métricas de Performance
- **Cold Start**: Primeira execução pode ser mais lenta
- **Memory**: Verificar uso de memória
- **Duration**: Tempo de execução das funções

### 3. Cron Job Status
- Verificar execução automática às quartas e sábados às 20:00
- Monitorar falhas e sucessos

## 🎯 Próximos Passos

1. **Deploy na Vercel** ✅
2. **Configurar variáveis de ambiente** ✅
3. **Testar endpoints** ✅
4. **Verificar geração de gráfico** ✅
5. **Monitorar execução automática** ✅
6. **Ajustar configurações se necessário** ✅

## 📞 Suporte

Se encontrar problemas:
1. Verificar logs na Vercel
2. Testar endpoints individualmente
3. Verificar variáveis de ambiente
4. Consultar documentação da Vercel 