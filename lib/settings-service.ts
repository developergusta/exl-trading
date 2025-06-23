import { isSupabaseConfigured, supabase } from "./supabase";

// Tipos para configurações do sistema
export interface SystemSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  setting_type: "boolean" | "string" | "number" | "object";
  description?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  updated_by?: string;
}

// Tipos para preferências do usuário
export interface UserPreference {
  id: string;
  user_id: string;
  preference_key: string;
  preference_value: any;
  preference_type: "boolean" | "string" | "number" | "object";
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

// Tipos para notificações do sistema
export interface SystemNotification {
  id: string;
  type: "general" | "individual" | "group";
  title: string;
  message: string;
  recipients: string[]; // Array de IDs de usuários ou ['all']
  sent_by: string;
  sent_at: string;
  status: "draft" | "sent" | "failed";
  read_by: Record<string, string>; // user_id: timestamp
  priority: "low" | "normal" | "high" | "urgent";
}

export class SettingsService {
  // ========================================
  // CONFIGURAÇÕES DO SISTEMA
  // ========================================

  /**
   * Obter todas as configurações do sistema (apenas admin)
   */
  async getSystemSettings(): Promise<SystemSetting[]> {
    if (!isSupabaseConfigured || !supabase) {
      // Fallback para localStorage
      return this.getSystemSettingsFromLocalStorage();
    }

    try {
      const { data, error } = await supabase
        .from("system_settings")
        .select("*")
        .order("setting_key");

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Erro ao buscar configurações do sistema:", error);
      return this.getSystemSettingsFromLocalStorage();
    }
  }

  /**
   * Obter uma configuração específica do sistema
   */
  async getSystemSetting(key: string): Promise<any> {
    if (!isSupabaseConfigured || !supabase) {
      // Fallback para localStorage
      const settings = JSON.parse(
        localStorage.getItem("systemSettings") || "{}"
      );
      return settings[key] || null;
    }

    try {
      const { data, error } = await supabase.rpc("get_system_setting", {
        setting_name: key,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Erro ao buscar configuração ${key}:`, error);
      // Fallback para localStorage
      const settings = JSON.parse(
        localStorage.getItem("systemSettings") || "{}"
      );
      return settings[key] || null;
    }
  }

  /**
   * Definir uma configuração do sistema (apenas admin)
   */
  async setSystemSetting(
    key: string,
    value: any,
    description?: string
  ): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) {
      // Fallback para localStorage
      return this.setSystemSettingInLocalStorage(key, value);
    }

    try {
      const { data, error } = await supabase.rpc("set_system_setting", {
        setting_name: key,
        setting_val: value,
        setting_desc: description,
      });

      if (error) throw error;
      return data === true;
    } catch (error) {
      console.error(`Erro ao definir configuração ${key}:`, error);
      // Fallback para localStorage
      return this.setSystemSettingInLocalStorage(key, value);
    }
  }

  /**
   * Obter configurações públicas do sistema (qualquer usuário)
   */
  async getPublicSystemSettings(): Promise<Record<string, any>> {
    if (!isSupabaseConfigured || !supabase) {
      // Retornar configurações básicas do localStorage
      const settings = JSON.parse(
        localStorage.getItem("systemSettings") || "{}"
      );
      return {
        app_name: settings.app_name || "EXL Trading",
        app_version: settings.app_version || "1.0.0",
        support_email: settings.support_email || "admin@exltrading.com",
        maintenance_mode: settings.maintenance_mode || false,
        allow_user_registration: settings.allow_user_registration !== false,
      };
    }

    try {
      const { data, error } = await supabase
        .from("system_settings")
        .select("setting_key, setting_value")
        .eq("is_public", true);

      if (error) throw error;

      const settings: Record<string, any> = {};
      data?.forEach((setting) => {
        settings[setting.setting_key] = setting.setting_value;
      });

      return settings;
    } catch (error) {
      console.error("Erro ao buscar configurações públicas:", error);
      return {};
    }
  }

  // ========================================
  // PREFERÊNCIAS DO USUÁRIO
  // ========================================

  /**
   * Obter todas as preferências do usuário atual
   */
  async getUserPreferences(): Promise<UserPreference[]> {
    if (!isSupabaseConfigured || !supabase) {
      // Fallback para localStorage
      return this.getUserPreferencesFromLocalStorage();
    }

    try {
      const { data, error } = await supabase
        .from("user_preferences")
        .select("*")
        .order("preference_key");

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Erro ao buscar preferências do usuário:", error);
      return this.getUserPreferencesFromLocalStorage();
    }
  }

  /**
   * Obter uma preferência específica do usuário
   */
  async getUserPreference(key: string): Promise<any> {
    if (!isSupabaseConfigured || !supabase) {
      // Fallback para localStorage
      const preferences = JSON.parse(
        localStorage.getItem(`userPreferences_${this.getCurrentUserId()}`) ||
          "{}"
      );
      return preferences[key] || null;
    }

    try {
      const { data, error } = await supabase.rpc("get_user_preference", {
        pref_key: key,
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Erro ao buscar preferência ${key}:`, error);
      // Fallback para localStorage
      const preferences = JSON.parse(
        localStorage.getItem(`userPreferences_${this.getCurrentUserId()}`) ||
          "{}"
      );
      return preferences[key] || null;
    }
  }

  /**
   * Definir uma preferência do usuário
   */
  async setUserPreference(key: string, value: any): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) {
      // Fallback para localStorage
      return this.setUserPreferenceInLocalStorage(key, value);
    }

    try {
      const { data, error } = await supabase.rpc("set_user_preference", {
        pref_key: key,
        pref_val: value,
      });

      if (error) throw error;
      return data === true;
    } catch (error) {
      console.error(`Erro ao definir preferência ${key}:`, error);
      // Fallback para localStorage
      return this.setUserPreferenceInLocalStorage(key, value);
    }
  }

  // ========================================
  // NOTIFICAÇÕES DO SISTEMA
  // ========================================

  /**
   * Criar nova notificação (apenas admin)
   */
  async createNotification(
    notification: Omit<SystemNotification, "id" | "sent_at" | "sent_by">
  ): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) {
      // Fallback para localStorage
      return this.createNotificationInLocalStorage(notification);
    }

    try {
      const { error } = await supabase.from("system_notifications").insert({
        type: notification.type,
        title: notification.title,
        message: notification.message,
        recipients: notification.recipients,
        status: notification.status || "sent",
        priority: notification.priority || "normal",
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Erro ao criar notificação:", error);
      return this.createNotificationInLocalStorage(notification);
    }
  }

  /**
   * Obter notificações do usuário atual
   */
  async getUserNotifications(): Promise<SystemNotification[]> {
    if (!isSupabaseConfigured || !supabase) {
      // Fallback para localStorage
      return this.getNotificationsFromLocalStorage();
    }

    try {
      const { data, error } = await supabase
        .from("system_notifications")
        .select("*")
        .order("sent_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Erro ao buscar notificações:", error);
      return this.getNotificationsFromLocalStorage();
    }
  }

  /**
   * Marcar notificação como lida
   */
  async markNotificationAsRead(notificationId: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) {
      return true; // Não implementado para localStorage
    }

    try {
      const { data: currentUser } = await supabase.auth.getUser();
      if (!currentUser.user) return false;

      // Buscar notificação atual
      const { data: notification, error: fetchError } = await supabase
        .from("system_notifications")
        .select("read_by")
        .eq("id", notificationId)
        .single();

      if (fetchError) throw fetchError;

      // Atualizar read_by
      const readBy = notification.read_by || {};
      readBy[currentUser.user.id] = new Date().toISOString();

      const { error: updateError } = await supabase
        .from("system_notifications")
        .update({ read_by: readBy })
        .eq("id", notificationId);

      if (updateError) throw updateError;
      return true;
    } catch (error) {
      console.error("Erro ao marcar notificação como lida:", error);
      return false;
    }
  }

  // ========================================
  // MÉTODOS AUXILIARES PARA LOCALSTORAGE
  // ========================================

  private getSystemSettingsFromLocalStorage(): SystemSetting[] {
    const settings = JSON.parse(localStorage.getItem("systemSettings") || "{}");
    return Object.entries(settings).map(([key, value]) => ({
      id: key,
      setting_key: key,
      setting_value: value,
      setting_type: typeof value as any,
      description: "",
      is_public: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
  }

  private setSystemSettingInLocalStorage(key: string, value: any): boolean {
    try {
      const settings = JSON.parse(
        localStorage.getItem("systemSettings") || "{}"
      );
      settings[key] = value;
      localStorage.setItem("systemSettings", JSON.stringify(settings));
      return true;
    } catch {
      return false;
    }
  }

  private getUserPreferencesFromLocalStorage(): UserPreference[] {
    const userId = this.getCurrentUserId();
    const preferences = JSON.parse(
      localStorage.getItem(`userPreferences_${userId}`) || "{}"
    );
    return Object.entries(preferences).map(([key, value]) => ({
      id: `${userId}_${key}`,
      user_id: userId,
      preference_key: key,
      preference_value: value,
      preference_type: typeof value as any,
      is_private: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
  }

  private setUserPreferenceInLocalStorage(key: string, value: any): boolean {
    try {
      const userId = this.getCurrentUserId();
      const preferences = JSON.parse(
        localStorage.getItem(`userPreferences_${userId}`) || "{}"
      );
      preferences[key] = value;
      localStorage.setItem(
        `userPreferences_${userId}`,
        JSON.stringify(preferences)
      );
      return true;
    } catch {
      return false;
    }
  }

  private createNotificationInLocalStorage(
    notification: Omit<SystemNotification, "id" | "sent_at" | "sent_by">
  ): boolean {
    try {
      const notifications = JSON.parse(
        localStorage.getItem("notifications") || "[]"
      );
      const newNotification = {
        id: `notif-${Date.now()}`,
        ...notification,
        sent_by: this.getCurrentUserId(),
        sent_at: new Date().toISOString(),
        read_by: {},
      };
      notifications.unshift(newNotification);
      localStorage.setItem("notifications", JSON.stringify(notifications));
      return true;
    } catch {
      return false;
    }
  }

  private getNotificationsFromLocalStorage(): SystemNotification[] {
    return JSON.parse(localStorage.getItem("notifications") || "[]");
  }

  private getCurrentUserId(): string {
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    return currentUser.id || "unknown";
  }
}

// Instância singleton do serviço
export const settingsService = new SettingsService();
