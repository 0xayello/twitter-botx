# Solução para Problema de Fontes no Gráfico MVRV

## Problema Identificado

O bot do Twitter estava gerando gráficos MVRV sem as fontes e legendas renderizadas corretamente. Apenas o gráfico visual aparecia, sem texto.

## Causa Raiz

**Incompatibilidade entre Chart.js v4.4.1 e @napi-rs/canvas**: O Chart.js v4 tem problemas conhecidos com renderização de fontes em ambientes Node.js sem DOM.

## Soluções Implementadas

### 1. Downgrade para Chart.js v3.9.1 ✅
- **Arquivo alterado**: `package.json`
- **Mudança**: `"chart.js": "^4.4.1"` → `"chart.js": "^3.9.1"`
- **Motivo**: Chart.js v3 tem melhor suporte para Node.js e renderização de fontes

### 2. Configuração de Adaptador ✅
- **Arquivo criado**: `src/services/chart-config.ts`
- **Função**: Registra adaptadores necessários para Chart.js funcionar com @napi-rs/canvas

### 3. Atualização do Código ✅
- **Arquivo alterado**: `src/services/chart.ts`
- **Mudanças**:
  - Import atualizado para usar configuração personalizada
  - Fonte alterada de 'Comic Sans MS' para 'Arial' (mais compatível)
  - Sintaxe atualizada para Chart.js v3

### 4. Script de Teste Simples ✅
- **Arquivo criado**: `test-chart-simple.js`
- **Função**: Testa geração básica de gráfico sem Chart.js para verificar se o problema é específico da biblioteca

## Como Testar

### Pré-requisitos
```bash
# Instalar Node.js (se não estiver instalado)
# macOS com Homebrew:
brew install node

# Ou baixar de: https://nodejs.org/
```

### Passos para Teste
1. **Instalar dependências**:
   ```bash
   npm install
   ```

2. **Testar gráfico simples** (sem Chart.js):
   ```bash
   node test-chart-simple.js
   ```

3. **Testar gráfico completo** (com Chart.js):
   ```bash
   npm run test-bot
   ```

## Verificação da Solução

Após as mudanças, o gráfico deve mostrar:
- ✅ Título "Bitcoin MVRV - Últimos 180 dias"
- ✅ Eixos X e Y com valores
- ✅ Legendas das zonas coloridas
- ✅ Linha azul do MVRV
- ✅ Fundo com zonas coloridas (vermelho, laranja, amarelo, verde)

## Arquivos Modificados

1. `package.json` - Versão do Chart.js
2. `src/services/chart.ts` - Código principal do gráfico
3. `src/services/chart-config.ts` - Configuração do Chart.js
4. `test-chart-simple.js` - Script de teste simples

## Próximos Passos

1. Instalar Node.js se necessário
2. Executar `npm install` para atualizar dependências
3. Testar com `node test-chart-simple.js`
4. Se funcionar, testar com `npm run test-bot`
5. Verificar se as fontes estão sendo renderizadas corretamente

## Alternativas (se o problema persistir)

### Opção A: Usar node-canvas
```bash
npm uninstall @napi-rs/canvas
npm install canvas
```

### Opção B: Implementação manual com canvas nativo
- Remover Chart.js completamente
- Usar apenas @napi-rs/canvas para desenhar o gráfico
- Implementar legendas e texto manualmente

### Opção C: Usar skia-canvas
```bash
npm uninstall @napi-rs/canvas
npm install skia-canvas
``` 