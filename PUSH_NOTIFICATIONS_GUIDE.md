# 🔔 Sistema de Push Notifications - EXL Trading Hub

Este documento explica como funciona o sistema de notificações push implementado no EXL Trading Hub.

## 📋 Visão Geral

O sistema implementado permite:

- ✅ Notificações push funcionais mesmo com app fechado
- ✅ Gerenciamento de permissões e subscriptions
- ✅ Interface administrativa para envio de notificações
- ✅ Componente para usuários configurarem notificações
- ✅ Service Worker atualizado com handlers completos

## 🏗️ Arquitetura

### 1. Service Worker (`public/sw.js`)

- **Push Event Handler**: Recebe e exibe notificações
- **Click Handler**: Gerencia cliques nas notificações
- **Subscription Management**: Renova subscriptions automaticamente

### 2. Push Service (`lib/push-service.ts`)

- **PushService Class**: Gerencia toda lógica de push notifications
- **Subscription Management**: Cria, remove e verifica subscriptions
- **Local Storage**: Armazena subscriptions localmente

### 3. Hook (`hooks/use-push-notifications.tsx`)

- **usePushNotifications**: Hook React para facilitar uso
- **Estado Reativo**: Gerencia status, permissões e loading
- **Funções Helper**: Subscribe, unsubscribe, teste

### 4. Componentes

- **NotificationCenter**: Interface admin para enviar notificações
- **PushNotificationSetup**: Interface usuário para configurar

## 🚀 Como Usar

### Para Administradores

1. **Acesse o Notification Center** (`/admin` → Notification Center)
2. **Verifique Status**: O card superior mostra se push notifications estão funcionando
3. **Habilite Push** (se necessário): Clique em "Habilitar Push"
4. **Configure Notificação**:
   - Escolha tipo (Geral/Individual/Grupo)
   - Selecione usuários (se aplicável)
   - Digite título e mensagem
   - Escolha método (Local ou Push)
5. **Envie**: Clique em "Enviar Push"

### Para Usuários

1. **Acesse Configurações**: Use o componente `PushNotificationSetup`
2. **Habilite Permissões**: Clique em "Habilitar Notificações"
3. **Ative Push**: Clique em "Ativar Notificações Push"
4. **Teste**: Use o botão "Testar" para verificar funcionamento

## 🔧 Integração no App

### 1. Adicionando o Setup para Usuários

```tsx
import { PushNotificationSetup } from "@/components/pwa/push-notification-setup";

// Em qualquer página/componente
<PushNotificationSetup />;
```

### 2. Usando o Hook

```tsx
import { usePushNotifications } from "@/hooks/use-push-notifications";

function MyComponent() {
  const push = usePushNotifications(userId);

  // Verificar status
  if (push.isSupported && push.hasPermission && push.isSubscribed) {
    // Push notifications estão ativos
  }

  // Enviar notificação de teste
  const sendTest = async () => {
    await push.sendTestNotification({
      title: "Teste",
      body: "Mensagem de teste",
    });
  };
}
```

### 3. Enviando Notificações Programaticamente

```tsx
import { pushService } from "@/lib/push-service";

// Enviar notificação local (teste)
await pushService.sendLocalNotification({
  title: "Título",
  body: "Mensagem",
  icon: "/icons/icon-192x192.png",
  data: { url: "/dashboard" },
});

// Obter subscriptions de usuários
const subscriptions = pushService.getAllSubscriptions();
console.log(`${subscriptions.length} usuários inscritos`);
```

## 🔐 Configuração VAPID (Produção)

Para produção, você precisa gerar chaves VAPID:

### 1. Instalar web-push

```bash
npm install web-push
```

### 2. Gerar Chaves

```javascript
const webpush = require("web-push");
const vapidKeys = webpush.generateVAPIDKeys();

console.log("Public Key:", vapidKeys.publicKey);
console.log("Private Key:", vapidKeys.privateKey);
```

### 3. Configurar Variáveis de Ambiente

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=sua_chave_publica_aqui
VAPID_PRIVATE_KEY=sua_chave_privada_aqui
VAPID_EMAIL=mailto:seu@email.com
```

### 4. Atualizar Service Worker

No `public/sw.js`, substitua a chave padrão pela sua:

```javascript
const vapidPublicKey =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "SUA_CHAVE_AQUI";
```

## 🌐 Servidor Push (Produção)

Para enviar notificações reais (não apenas locais), implemente um endpoint:

### 1. API Route (`app/api/push/send/route.ts`)

```typescript
import webpush from "web-push";

webpush.setVapidDetails(
  "mailto:seu@email.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(request: Request) {
  const { subscription, payload } = await request.json();

  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    return Response.json({ success: true });
  } catch (error) {
    return Response.json(
      { error: "Failed to send notification" },
      { status: 500 }
    );
  }
}
```

### 2. Integrar com NotificationCenter

```typescript
// No handleSendNotification do NotificationCenter
const response = await fetch("/api/push/send", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    subscriptions: targetSubscriptions,
    payload: pushNotification,
  }),
});
```

## 📱 Recursos Implementados

### Funcionalidades Básicas

- ✅ Subscribe/Unsubscribe
- ✅ Verificação de suporte
- ✅ Gerenciamento de permissões
- ✅ Armazenamento local de subscriptions
- ✅ Notificações de teste

### Service Worker

- ✅ Handler para receber push events
- ✅ Handler para cliques em notificações
- ✅ Renovação automática de subscriptions
- ✅ Abertura/foco automático do app

### Interface de Usuário

- ✅ Status visual das notificações
- ✅ Configuração fácil para usuários
- ✅ Painel administrativo completo
- ✅ Histórico de notificações enviadas

### Personalização

- ✅ Ícones e badges customizáveis
- ✅ Ações personalizadas nas notificações
- ✅ Redirecionamento para URLs específicas
- ✅ Vibração e sons customizáveis

## 🐛 Troubleshooting

### Notificações não aparecem

1. Verifique se o navegador suporta push notifications
2. Confirme que permissões foram concedidas
3. Teste se o Service Worker está registrado
4. Verifique console para erros

### Subscription falha

1. Confirme que VAPID keys estão corretas
2. Verifique se Service Worker está ativo
3. Teste em navegador diferente
4. Verifique se PWA está instalado

### Cliques não funcionam

1. Confirme que URLs estão corretas
2. Verifique se app está no mesmo domínio
3. Teste handlers no Service Worker
4. Verifique console do Service Worker

## 📊 Monitoramento

### Métricas Importantes

- Número de subscriptions ativas
- Taxa de sucesso de envio
- Taxa de cliques nas notificações
- Erros de subscription

### Logs Úteis

```javascript
// No console do navegador
console.log("Subscriptions:", localStorage.getItem("push-subscriptions"));

// No Service Worker
console.log("Push received:", event.data.text());
```

## 🎯 Próximos Passos

### Melhorias Sugeridas

1. **Backend Real**: Implementar servidor push com web-push
2. **Analytics**: Rastrear métricas de notificações
3. **Segmentação**: Grupos de usuários para targeting
4. **Agendamento**: Notificações programadas
5. **A/B Testing**: Testar diferentes formatos

### Integrações

1. **Database**: Armazenar subscriptions no Supabase
2. **Queue System**: Sistema de filas para envios em massa
3. **Templates**: Templates de notificação reutilizáveis
4. **Personalization**: Notificações baseadas em comportamento

---

## 💡 Exemplo de Uso Completo

```tsx
// Componente de exemplo usando todas as funcionalidades
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { PushNotificationSetup } from "@/components/pwa/push-notification-setup";

export function TradingDashboard() {
  const { user } = useAuth();
  const push = usePushNotifications(user?.id);

  // Enviar alerta de trade
  const sendTradeAlert = async (trade: Trade) => {
    if (push.isSubscribed) {
      await push.sendTestNotification({
        title: `🚨 Alerta de Trade`,
        body: `${trade.symbol}: ${trade.action} a ${trade.price}`,
        data: { url: `/trades/${trade.id}` },
        requireInteraction: true,
      });
    }
  };

  return (
    <div>
      {/* Setup das notificações */}
      <PushNotificationSetup />

      {/* Seus componentes de trading */}
      <TradingChart onTradeAlert={sendTradeAlert} />
    </div>
  );
}
```

O sistema está pronto para uso em desenvolvimento e pode ser facilmente expandido para produção!
