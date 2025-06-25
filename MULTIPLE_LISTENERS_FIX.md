# Correção de Múltiplos Listeners onAuthStateChange

## Problema Identificado

A aplicação tinha **3 listeners** diferentes para `onAuthStateChange` do Supabase, causando:

- Execução duplicada de lógica
- Condições de corrida
- Performance degradada
- Comportamentos inconsistentes

### Listeners Identificados:

1. **hooks/use-auth.tsx** (linha 83) - Gerenciamento de estado de autenticação
2. **lib/auth-service.ts** (linha 515) - Wrapper para outros componentes
3. **lib/connection-monitor.ts** (linha 37) - Monitoramento de conexão

## Solução Implementada

### 1. Centralização no AuthProvider

- **Mantido apenas 1 listener** no `AuthProvider` (`hooks/use-auth.tsx`)
- Usa o método `setupAuthStateListener()` do AuthService
- Centraliza toda lógica de mudança de estado de autenticação

### 2. Refatoração do AuthService

```typescript
// ÚNICO método para auth state changes
onAuthStateChange(callback: (user: User | null) => void) {
  // Este é o ÚNICO lugar onde supabase.auth.onAuthStateChange é chamado
  // Todos os outros componentes devem usar este método
}
```

### 3. Refatoração do ConnectionMonitor

- **Removido listener direto** do Supabase
- **Adicionado método** `handleAuthStateChange()`
- Recebe notificações do `AuthProvider` via callback

```typescript
// Novo método para receber notificações
handleAuthStateChange(event: string, isConnected: boolean) {
  if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
    this.notifyCallbacks(true);
  } else if (event === "SIGNED_OUT") {
    this.notifyCallbacks(false);
  }
}
```

### 4. Integração no AuthProvider

```typescript
// AuthProvider usa o ÚNICO método do AuthService
const unsubscribe = authService.onAuthStateChange(
  async (authUser: User | null) => {
    if (authUser) {
      setUser(authUser);
      setIsAuthenticated(true);
      // Notifica o connection monitor
      connectionMonitor.handleAuthStateChange("SIGNED_IN", true);
    } else {
      setUser(null);
      setIsAuthenticated(false);
      // Notifica o connection monitor
      connectionMonitor.handleAuthStateChange("SIGNED_OUT", false);
    }
  }
);
```

## Benefícios da Correção

✅ **Apenas 1 listener** do Supabase ativo por vez
✅ **Elimina condições de corrida** entre listeners
✅ **Melhora performance** - menos processamento duplicado
✅ **Código mais limpo** - responsabilidades bem definidas
✅ **Melhor debugabilidade** - logs centralizados
✅ **Compatibilidade mantida** - AuthService ainda funciona

## Arquitetura Final

```
Supabase Auth
     ↓ (1 listener apenas)
AuthService.onAuthStateChange() ← ÚNICO lugar que chama o Supabase
     ↓
AuthProvider (hooks/use-auth.tsx) ← ÚNICO lugar que usa o AuthService
     ├─→ setUser(), setIsAuthenticated()
     └─→ connectionMonitor.handleAuthStateChange()
```

## Próximos Passos

1. **Testar em produção** - Verificar comportamento com usuários reais
2. **Remover método deprecated** - Após confirmar que nada mais usa `onAuthStateChange()`
3. **Monitorar logs** - Verificar se não há mais execuções duplicadas

## Validação

- ✅ Build executado com sucesso
- ✅ TypeScript sem erros
- ✅ Logs mais limpos e organizados
- ✅ Apenas 1 listener ativo do Supabase

**Status:** 🟢 **CORRIGIDO** - Múltiplos listeners eliminados com sucesso
