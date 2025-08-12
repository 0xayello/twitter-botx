#!/bin/bash

echo "🚀 Iniciando deploy do Bot Twitter MVRV..."

# Verificar se o git está limpo
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  Existem mudanças não commitadas. Commitando..."
    git add .
    git commit -m "feat: correção das fontes do gráfico MVRV"
fi

# Push para o GitHub
echo "📤 Fazendo push para o GitHub..."
git push origin main

echo "✅ Deploy iniciado!"
echo ""
echo "📋 Próximos passos:"
echo "1. Acesse https://vercel.com"
echo "2. Verifique se o deploy está rodando"
echo "3. Teste os endpoints:"
echo "   - Health: https://seu-projeto.vercel.app/api/health"
echo "   - Teste gráfico: https://seu-projeto.vercel.app/api/test-chart"
echo "4. Verifique os logs na Vercel"
echo ""
echo "🔍 Para monitorar o deploy:"
echo "   vercel logs --follow" 