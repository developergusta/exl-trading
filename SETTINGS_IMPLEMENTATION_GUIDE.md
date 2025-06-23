# Guia de Implementação - Configurações do Sistema e Usuário

## Resumo

Baseado na análise dos scripts de banco de dados existentes e dos componentes da aplicação, identifiquei a necessidade de criar estruturas para:

1. **Configurações do Sistema** - Para administradores gerenciarem o comportamento global da aplicação
2. **Preferências do Usuário** - Para cada usuário personalizar sua experiência
3. **Notificações do Sistema** - Para gerenciar notificações enviadas pelos administradores

## 📊 Estrutura do Banco de Dados

### 1. Script SQL Criado

Criei o arquivo `scripts/system-user-settings-setup.sql` que inclui:

#### Tabelas Criadas:

1. **`system_settings`** - Configurações globais do sistema

   - `setting_key` (único): Chave da configuração
   - `setting_value` (JSONB): Valor em formato JSON flexível
   - `setting_type`: Tipo do valor (boolean, string, number, object)
   - `is_public`: Se pode ser lida por usuários não-admin
   - Políticas RLS para admins e usuários

2. **`user_preferences`** - Preferências individuais dos usuários

   - `user_id`: Referência ao usuário
   - `preference_key`: Chave da preferência
   - `preference_value` (JSONB): Valor em formato JSON
   - `is_private`: Se a preferência é privada
   - Políticas RLS para cada usuário

3. **`system_notifications`** - Histórico de notificações
   - `type`: general, individual, group
   - `recipients` (JSONB): Array de IDs ou 'all'
   - `read_by` (JSONB): Controle de leitura
   - `priority`: low, normal, high, urgent

#### Funções SQL Criadas:

- `get_system_setting(setting_name)`: Obter configuração
- `set_system_setting(setting_name, value)`: Definir configuração (admin only)
- `get_user_preference(pref_key)`: Obter preferência do usuário
- `set_user_preference(pref_key, value)`: Definir preferência

## 🛠️ Implementação no Frontend

### 1. Serviço de Configurações

Criei `lib/settings-service.ts` com:

- **SettingsService**: Classe principal para gerenciar configurações
- **Fallback para localStorage**: Compatibilidade quando Supabase não está disponível
- **Métodos principais**:
  - `getSystemSettings()`, `setSystemSetting()`
  - `getUserPreferences()`, `setUserPreference()`
  - `createNotification()`, `getUserNotifications()`

### 2. Hook React

Criei `hooks/use-settings.tsx` com:

- **SettingsProvider**: Contexto React para configurações
- **useSettings()**: Hook principal
- **useSystemSettings()**: Hook específico para admins
- **useUserPreferences()**: Hook específico para usuários

### 3. Componentes

1. **`components/admin/enhanced-system-settings.tsx`**:

   - Versão melhorada das configurações do sistema
   - Suporte a mudanças não salvas
   - Integração com banco de dados
   - Fallback para localStorage

2. **`components/community/user-preferences.tsx`**:
   - Interface para preferências do usuário
   - Configurações de aparência, notificações, idioma
   - Sincronização automática

## 📋 Configurações Implementadas

### Configurações do Sistema (Admin):

- `autoApproveUsers`: Aprovação automática de usuários
- `allowUserRegistration`: Permitir novos cadastros
- `enablePushNotifications`: Habilitar notificações push
- `maintenanceMode`: Modo manutenção
- `maxUsersPerDay`: Limite de usuários por dia
- `sessionTimeout`: Timeout da sessão
- `appName`: Nome da aplicação
- `appVersion`: Versão da aplicação
- `supportEmail`: Email de suporte

### Preferências do Usuário:

- `theme`: light/dark
- `language`: pt-BR/en-US
- `notifications`: Receber notificações
- `emailNotifications`: Notificações por email
- `soundEnabled`: Sons do sistema
- `autoSave`: Salvamento automático
- `compactMode`: Interface compacta
- `showWelcomeScreen`: Tela de boas-vindas
- `defaultDashboardTab`: Aba padrão do dashboard
- `timezone`: Fuso horário

## 🚀 Como Implementar

### 1. Executar Script SQL

```sql
-- No Supabase SQL Editor, execute o conteúdo de:
-- scripts/system-user-settings-setup.sql
```

### 2. Adicionar Provider ao Layout

```tsx
// Em app/layout.tsx ou equivalente
import { SettingsProvider } from "@/hooks/use-settings";

export default function RootLayout({ children }) {
  return (
    <AuthProvider>
      <SettingsProvider>{children}</SettingsProvider>
    </AuthProvider>
  );
}
```

### 3. Usar nos Componentes

```tsx
// Para configurações do sistema (admin)
import { useSystemSettings } from "@/hooks/use-settings";

function AdminPanel() {
  const { systemSettings, updateSystemSetting } = useSystemSettings();

  const handleToggle = async (key, value) => {
    await updateSystemSetting(key, value);
  };
}

// Para preferências do usuário
import { useUserPreferences } from "@/hooks/use-settings";

function UserSettings() {
  const { userPreferences, updateUserPreference } = useUserPreferences();

  const handleThemeChange = async (theme) => {
    await updateUserPreference("theme", theme);
  };
}
```

### 4. Substituir Componentes Existentes

- Substituir `components/admin/system-settings.tsx` por `enhanced-system-settings.tsx`
- Adicionar `components/community/user-preferences.tsx` às páginas de perfil

## 🔧 Recursos Adicionais

### Fallback para localStorage

- Sistema continua funcionando sem Supabase
- Migração automática quando banco está disponível
- Compatibilidade com implementação atual

### Segurança

- Row Level Security (RLS) habilitado
- Políticas específicas para admins e usuários
- Configurações sensíveis apenas para admins

### Performance

- Valores em JSONB para flexibilidade
- Índices otimizados
- Cache no frontend via React Context

## 📝 Próximos Passos

1. **Executar script SQL** no Supabase
2. **Adicionar SettingsProvider** ao layout
3. **Testar configurações básicas**
4. **Migrar componentes existentes**
5. **Implementar notificações avançadas**

## 🐛 Troubleshooting

### Problemas Comuns:

1. **Configurações não salvam**: Verificar se usuário é admin
2. **Fallback não funciona**: Verificar localStorage do navegador
3. **Erro de RLS**: Verificar políticas de segurança no Supabase
4. **Hook não encontrado**: Verificar se Provider está configurado

### Logs para Debug:

```javascript
// Verificar se Supabase está configurado
console.log("Supabase configured:", isSupabaseConfigured);

// Verificar configurações carregadas
console.log("System settings:", systemSettings);
console.log("User preferences:", userPreferences);
```

Esta implementação fornece uma base sólida para gerenciar configurações do sistema e preferências do usuário, com suporte tanto para banco de dados quanto para localStorage como fallback.
