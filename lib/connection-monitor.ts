import { isSupabaseConfigured, supabase } from "./supabase";

export class ConnectionMonitor {
  private static instance: ConnectionMonitor;
  private isMonitoring = false;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private callbacks: Array<(isConnected: boolean) => void> = [];

  static getInstance(): ConnectionMonitor {
    if (!ConnectionMonitor.instance) {
      ConnectionMonitor.instance = new ConnectionMonitor();
    }
    return ConnectionMonitor.instance;
  }

  startMonitoring() {
    if (this.isMonitoring || !isSupabaseConfigured || !supabase) return;

    this.isMonitoring = true;
    console.log("ConnectionMonitor: Starting connection monitoring");

    // Monitor de rede básico
    window.addEventListener("online", this.handleOnline);
    window.addEventListener("offline", this.handleOffline);

    // Heartbeat para verificar conectividade com Supabase
    this.startHeartbeat();
  }

  stopMonitoring() {
    if (!this.isMonitoring) return;

    this.isMonitoring = false;
    console.log("ConnectionMonitor: Stopping connection monitoring");

    window.removeEventListener("online", this.handleOnline);
    window.removeEventListener("offline", this.handleOffline);

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  private handleOnline = () => {
    console.log("ConnectionMonitor: Network back online");
    this.scheduleReconnect();
  };

  private handleOffline = () => {
    console.log("ConnectionMonitor: Network went offline");
    this.notifyCallbacks(false);
  };

  private startHeartbeat() {
    if (this.heartbeatInterval) return;

    this.heartbeatInterval = setInterval(async () => {
      const isConnected = await this.checkSupabaseConnection();
      this.notifyCallbacks(isConnected);
    }, 60000); // Verifica a cada minuto
  }

  private async checkSupabaseConnection(): Promise<boolean> {
    if (!supabase) return false;

    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.warn("ConnectionMonitor: Session check failed:", error.message);
        return false;
      }
      return true;
    } catch (error) {
      console.warn("ConnectionMonitor: Connection check failed:", error);
      return false;
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimeout) return;

    this.reconnectTimeout = setTimeout(async () => {
      console.log("ConnectionMonitor: Attempting to restore connection...");

      try {
        const isConnected = await this.checkSupabaseConnection();
        if (isConnected) {
          console.log("ConnectionMonitor: Connection restored successfully");
          this.notifyCallbacks(true);
        } else {
          console.log("ConnectionMonitor: Connection still not available");
          // Tenta novamente em 30 segundos
          this.reconnectTimeout = null;
          this.scheduleReconnect();
        }
      } catch (error) {
        console.error("ConnectionMonitor: Reconnect failed:", error);
        // Tenta novamente em 30 segundos
        this.reconnectTimeout = null;
        this.scheduleReconnect();
      }

      this.reconnectTimeout = null;
    }, 5000); // Aguarda 5 segundos antes de tentar reconectar
  }

  onConnectionChange(callback: (isConnected: boolean) => void) {
    this.callbacks.push(callback);
    return () => {
      this.callbacks = this.callbacks.filter((cb) => cb !== callback);
    };
  }

  private notifyCallbacks(isConnected: boolean) {
    this.callbacks.forEach((callback) => {
      try {
        callback(isConnected);
      } catch (error) {
        console.error("ConnectionMonitor: Error in callback:", error);
      }
    });
  }

  // Método para receber notificações de auth state do AuthProvider
  handleAuthStateChange(event: string, isConnected: boolean) {
    console.log(`ConnectionMonitor: Auth state change received - ${event}`);

    if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
      console.log("ConnectionMonitor: User signed in or token refreshed");
      this.notifyCallbacks(true);
    } else if (event === "SIGNED_OUT") {
      console.log("ConnectionMonitor: User signed out");
      this.notifyCallbacks(false);
    }
  }

  async forceReconnect(): Promise<boolean> {
    console.log("ConnectionMonitor: Force reconnect requested");

    if (!supabase) return false;

    try {
      // Tenta refresh da sessão
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.warn("ConnectionMonitor: Force refresh failed:", error.message);
        return false;
      }

      console.log("ConnectionMonitor: Force reconnect successful");
      this.notifyCallbacks(true);
      return true;
    } catch (error) {
      console.error("ConnectionMonitor: Force reconnect failed:", error);
      return false;
    }
  }
}

export const connectionMonitor = ConnectionMonitor.getInstance();
