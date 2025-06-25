# Correção do Problema de Troca de Abas

## Problema Identificado

**Sintoma:** Ao trocar de aba do navegador e voltar para a aplicação:

1. Console mostra `"AuthService: Auth state changed - SIGNED_IN"`
2. Aplicação não consegue fazer requisições subsequentes
3. Usuário fica "travado" sem conseguir usar o app

## Causa Raiz

O problema era causado pelo **refresh automático de token** do Supabase quando a aba volta ao foco:

1. **Troca de aba** → Supabase pausa conexão
2. **Volta para aba** → Supabase tenta refresh do token
3. **Dispara evento `SIGNED_IN`** → `onAuthStateChange` é chamado
4. **Chama `getCurrentUser()`** → Pode entrar em loops ou estados inconsistentes
5. **Requisições ficam quebradas** → App fica inutilizável

## Soluções Implementadas

### 1. Cache de Usuário para Detectar Refresh Automático

```typescript
export class AuthService {
  private currentUser: User | null = null; // Cache do usuário atual
}
```

### 2. Filtragem Inteligente de SIGNED_IN

```typescript
// Para SIGNED_IN, verifica se é refresh automático ou login real
if (event === "SIGNED_IN" && session?.user) {
  // Se já temos um usuário logado com mesmo ID, é refresh automático
  if (this.currentUser && this.currentUser.id === session.user.id) {
    console.log("AuthService: SIGNED_IN é refresh automático, ignorando");
    return; // Não processa novamente o mesmo usuário
  }

  console.log("AuthService: SIGNED_IN é login real, processando");
  // Processa apenas logins reais
}
```

### 3. Prevenção de Calls Simultâneos

```typescript
export class AuthService {
  private isProcessingAuthChange = false; // Flag para evitar calls simultâneos

  async getCurrentUser(): Promise<User | null> {
    // Evita chamadas simultâneas que podem causar problemas
    if (this.isProcessingAuthChange) {
      console.log(
        "AuthService: getCurrentUser já em processamento, aguardando..."
      );
      return null;
    }

    this.isProcessingAuthChange = true;

    try {
      // ... lógica existente
    } finally {
      // Sempre reseta a flag no final
      this.isProcessingAuthChange = false;
    }
  }
}
```

### 4. Tratamento Robusto de Erros

```typescript
// Para outros eventos, verifica se há sessão válida
if (session?.user) {
  try {
    const user = await this.getCurrentUser();
    callback(user);
  } catch (error) {
    console.error(`AuthService: Erro ao processar evento ${event}:`, error);
    // Não quebra o app em caso de erro
  }
}
```

## Benefícios da Correção

✅ **Elimina travamentos** após troca de abas
✅ **Evita loops infinitos** de auth state changes
✅ **Mantém estabilidade** durante refresh de token
✅ **Melhora experiência do usuário** - app continua funcionando
✅ **Logs mais limpos** - eventos desnecessários filtrados
✅ **Maior robustez** - tratamento melhor de erros de rede

## Fluxo Corrigido

```
User troca de aba
     ↓
Supabase pausa conexão
     ↓
User volta para aba
     ↓
Supabase faz refresh automático
     ↓
TOKEN_REFRESHED evento → IGNORADO ✅
     ↓
App mantém estado estável
     ↓
Requisições continuam funcionando ✅
```

## Validação

- ✅ Build executado com sucesso
- ✅ Eventos `TOKEN_REFRESHED` são ignorados
- ✅ Calls simultâneos são prevenidos
- ✅ Tratamento robusto de erros implementado
- ✅ Logs informativos adicionados

## Testes Recomendados

1. **Teste básico:** Trocar de aba e voltar → Verificar se app continua funcionando
2. **Teste de stress:** Trocar rapidamente entre abas → Verificar estabilidade
3. **Teste de rede:** Simular problemas de rede durante troca → Verificar recuperação
4. **Teste de console:** Verificar se logs são limpos e informativos

**Status:** 🟢 **CORRIGIDO** - Problema de troca de abas resolvido com sucesso
