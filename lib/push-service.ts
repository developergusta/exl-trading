export interface PushSubscription {
  id?: string;
  userId: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent?: string;
  createdAt?: string;
}

export interface PushNotification {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  requireInteraction?: boolean;
  vibrate?: number[];
  silent?: boolean;
  url?: string;
}

export class PushService {
  private static instance: PushService;
  private subscriptions: PushSubscription[] = [];

  constructor() {
    this.loadSubscriptions();
  }

  static getInstance(): PushService {
    if (!PushService.instance) {
      PushService.instance = new PushService();
    }
    return PushService.instance;
  }

  // Verifica se push notifications são suportados
  isSupported(): boolean {
    return (
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window
    );
  }

  // Verifica se o usuário deu permissão
  async hasPermission(): Promise<boolean> {
    if (!this.isSupported()) return false;

    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  // Solicita permissão ao usuário
  async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) {
      throw new Error("Push notifications não são suportados neste navegador");
    }

    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  // Registra o service worker e obtém subscription
  async subscribe(userId: string): Promise<PushSubscription | null> {
    try {
      if (!(await this.hasPermission())) {
        const granted = await this.requestPermission();
        if (!granted) {
          throw new Error("Permissão negada para notificações");
        }
      }

      const registration = await navigator.serviceWorker.ready;

      // Gera ou usa VAPID key existente
      const vapidPublicKey =
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
        "BOJ7JREH-VIB1X8cC7xKGf-XSY4aP8gEyDUBSGUXWPi9eGcwdLzA_7FjT7q1lzYfpT8Qk2L5R8J7G9P8sE2D";

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey),
      });

      const pushSubscription: PushSubscription = {
        id: `sub-${Date.now()}`,
        userId,
        endpoint: subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(subscription.getKey("p256dh")!),
          auth: this.arrayBufferToBase64(subscription.getKey("auth")!),
        },
        userAgent: navigator.userAgent,
        createdAt: new Date().toISOString(),
      };

      // Remove subscription anterior do mesmo usuário
      this.subscriptions = this.subscriptions.filter(
        (sub) => sub.userId !== userId
      );

      // Adiciona nova subscription
      this.subscriptions.push(pushSubscription);
      this.saveSubscriptions();

      console.log("Push subscription criada:", pushSubscription);
      return pushSubscription;
    } catch (error) {
      console.error("Erro ao criar push subscription:", error);
      throw error;
    }
  }

  // Remove subscription
  async unsubscribe(userId: string): Promise<boolean> {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
      }

      // Remove do storage local
      this.subscriptions = this.subscriptions.filter(
        (sub) => sub.userId !== userId
      );
      this.saveSubscriptions();

      return true;
    } catch (error) {
      console.error("Erro ao remover subscription:", error);
      return false;
    }
  }

  // Obtém subscription atual do usuário
  getSubscription(userId: string): PushSubscription | null {
    return this.subscriptions.find((sub) => sub.userId === userId) || null;
  }

  // Lista todas as subscriptions
  getAllSubscriptions(): PushSubscription[] {
    return [...this.subscriptions];
  }

  // Envia notificação local (para teste)
  async sendLocalNotification(notification: PushNotification): Promise<void> {
    if (!this.isSupported() || !(await this.hasPermission())) {
      throw new Error("Notificações não estão disponíveis");
    }

    const registration = await navigator.serviceWorker.ready;

    const notificationOptions: any = {
      body: notification.body,
      icon: notification.icon || "/icons/icon-192x192.png",
      badge: notification.badge || "/icons/icon-72x72.png",
      tag: notification.tag || "exl-notification",
      data: notification.data || {},
      actions: notification.actions || [
        {
          action: "open",
          title: "Abrir App",
          icon: "/icons/icon-72x72.png",
        },
      ],
      requireInteraction: notification.requireInteraction || false,
      vibrate: notification.vibrate || [200, 100, 200],
      silent: notification.silent || false,
    };

    // Adiciona image se fornecida (nem todos os browsers suportam)
    if (notification.image) {
      notificationOptions.image = notification.image;
    }

    await registration.showNotification(
      notification.title,
      notificationOptions
    );
  }

  // Simula envio de push notification (para desenvolvimento)
  async sendTestNotification(
    userIds: string[],
    notification: PushNotification
  ): Promise<{ success: string[]; failed: string[] }> {
    const results = { success: [] as string[], failed: [] as string[] };

    for (const userId of userIds) {
      try {
        const subscription = this.getSubscription(userId);
        if (!subscription) {
          results.failed.push(userId);
          continue;
        }

        // Em produção, isso seria enviado via servidor para o push service
        // Por ora, enviamos uma notificação local para simular
        await this.sendLocalNotification(notification);
        results.success.push(userId);

        console.log(`Notificação enviada para usuário ${userId}`);
      } catch (error) {
        console.error(`Erro ao enviar para usuário ${userId}:`, error);
        results.failed.push(userId);
      }
    }

    return results;
  }

  // Verifica status da subscription atual
  async checkSubscriptionStatus(): Promise<boolean> {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      return subscription !== null;
    } catch (error) {
      console.error("Erro ao verificar subscription:", error);
      return false;
    }
  }

  // Funções helper privadas
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private loadSubscriptions(): void {
    try {
      const stored = localStorage.getItem("push-subscriptions");
      if (stored) {
        this.subscriptions = JSON.parse(stored);
      }
    } catch (error) {
      console.error("Erro ao carregar subscriptions:", error);
      this.subscriptions = [];
    }
  }

  private saveSubscriptions(): void {
    try {
      localStorage.setItem(
        "push-subscriptions",
        JSON.stringify(this.subscriptions)
      );
    } catch (error) {
      console.error("Erro ao salvar subscriptions:", error);
    }
  }
}

// Export singleton instance
export const pushService = PushService.getInstance();
