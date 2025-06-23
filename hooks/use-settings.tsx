"use client";

import { settingsService } from "@/lib/settings-service";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

// Configurações padrão do sistema
const DEFAULT_SYSTEM_SETTINGS = {
  autoApproveUsers: false,
  allowUserRegistration: true,
  enablePushNotifications: true,
  maintenanceMode: false,
  maxUsersPerDay: 10,
  sessionTimeout: 24,
  appName: "EXL Trading",
  appVersion: "1.0.0",
  supportEmail: "admin@exltrading.com",
};

// Preferências padrão do usuário
const DEFAULT_USER_PREFERENCES: UserPreferences = {
  theme: "dark",
  language: "pt-BR",
  notifications: true,
  emailNotifications: true,
  soundEnabled: true,
  autoSave: true,
  compactMode: false,
  showWelcomeScreen: true,
  defaultDashboardTab: "overview",
  timezone: "America/Sao_Paulo",
};

interface SystemSettings {
  autoApproveUsers: boolean;
  allowUserRegistration: boolean;
  enablePushNotifications: boolean;
  maintenanceMode: boolean;
  maxUsersPerDay: number;
  sessionTimeout: number;
  appName: string;
  appVersion: string;
  supportEmail: string;
}

interface UserPreferences {
  theme: "light" | "dark";
  language: string;
  notifications: boolean;
  emailNotifications: boolean;
  soundEnabled: boolean;
  autoSave: boolean;
  compactMode: boolean;
  showWelcomeScreen: boolean;
  defaultDashboardTab: string;
  timezone: string;
}

interface SettingsContextType {
  // Configurações do sistema
  systemSettings: SystemSettings;
  updateSystemSetting: (
    key: keyof SystemSettings,
    value: any
  ) => Promise<boolean>;
  refreshSystemSettings: () => Promise<void>;
  isLoadingSystemSettings: boolean;

  // Preferências do usuário
  userPreferences: UserPreferences;
  updateUserPreference: (
    key: keyof UserPreferences,
    value: any
  ) => Promise<boolean>;
  refreshUserPreferences: () => Promise<void>;
  isLoadingUserPreferences: boolean;

  // Configurações públicas
  publicSettings: Record<string, any>;
  getPublicSetting: (key: string) => any;

  // Notificações
  sendNotification: (
    type: "general" | "individual" | "group",
    title: string,
    message: string,
    recipients?: string[]
  ) => Promise<boolean>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(
    DEFAULT_SYSTEM_SETTINGS
  );
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(
    DEFAULT_USER_PREFERENCES
  );
  const [publicSettings, setPublicSettings] = useState<Record<string, any>>({});
  const [isLoadingSystemSettings, setIsLoadingSystemSettings] = useState(true);
  const [isLoadingUserPreferences, setIsLoadingUserPreferences] =
    useState(true);

  // Carregar configurações do sistema
  const loadSystemSettings = async () => {
    setIsLoadingSystemSettings(true);
    try {
      // Tentar carregar configurações individuais
      const settingsPromises = Object.keys(DEFAULT_SYSTEM_SETTINGS).map(
        async (key) => {
          const value = await settingsService.getSystemSetting(key);
          return [key, value];
        }
      );

      const settingsResults = await Promise.all(settingsPromises);
      const loadedSettings: any = { ...DEFAULT_SYSTEM_SETTINGS };

      settingsResults.forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          loadedSettings[key] = value;
        }
      });

      setSystemSettings(loadedSettings);
    } catch (error) {
      console.error("Erro ao carregar configurações do sistema:", error);
      // Manter configurações padrão em caso de erro
    } finally {
      setIsLoadingSystemSettings(false);
    }
  };

  // Carregar preferências do usuário
  const loadUserPreferences = async () => {
    setIsLoadingUserPreferences(true);
    try {
      // Tentar carregar preferências individuais
      const preferencesPromises = Object.keys(DEFAULT_USER_PREFERENCES).map(
        async (key) => {
          const value = await settingsService.getUserPreference(key);
          return [key, value];
        }
      );

      const preferencesResults = await Promise.all(preferencesPromises);
      const loadedPreferences: any = { ...DEFAULT_USER_PREFERENCES };

      preferencesResults.forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          loadedPreferences[key] = value;
        }
      });

      setUserPreferences(loadedPreferences);
    } catch (error) {
      console.error("Erro ao carregar preferências do usuário:", error);
      // Manter preferências padrão em caso de erro
    } finally {
      setIsLoadingUserPreferences(false);
    }
  };

  // Carregar configurações públicas
  const loadPublicSettings = async () => {
    try {
      const settings = await settingsService.getPublicSystemSettings();
      setPublicSettings(settings);
    } catch (error) {
      console.error("Erro ao carregar configurações públicas:", error);
    }
  };

  // Atualizar configuração do sistema
  const updateSystemSetting = async (
    key: keyof SystemSettings,
    value: any
  ): Promise<boolean> => {
    try {
      const success = await settingsService.setSystemSetting(key, value);
      if (success) {
        setSystemSettings((prev) => ({ ...prev, [key]: value }));
      }
      return success;
    } catch (error) {
      console.error(`Erro ao atualizar configuração ${key}:`, error);
      return false;
    }
  };

  // Atualizar preferência do usuário
  const updateUserPreference = async (
    key: keyof UserPreferences,
    value: any
  ): Promise<boolean> => {
    try {
      const success = await settingsService.setUserPreference(key, value);
      if (success) {
        setUserPreferences((prev) => ({ ...prev, [key]: value }));
      }
      return success;
    } catch (error) {
      console.error(`Erro ao atualizar preferência ${key}:`, error);
      return false;
    }
  };

  // Refresh functions
  const refreshSystemSettings = async () => {
    await loadSystemSettings();
  };

  const refreshUserPreferences = async () => {
    await loadUserPreferences();
  };

  // Obter configuração pública
  const getPublicSetting = (key: string) => {
    return publicSettings[key] || null;
  };

  // Enviar notificação
  const sendNotification = async (
    type: "general" | "individual" | "group",
    title: string,
    message: string,
    recipients: string[] = ["all"]
  ): Promise<boolean> => {
    try {
      return await settingsService.createNotification({
        type,
        title,
        message,
        recipients,
        status: "sent",
        priority: "normal",
        read_by: {},
      });
    } catch (error) {
      console.error("Erro ao enviar notificação:", error);
      return false;
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    loadSystemSettings();
    loadUserPreferences();
    loadPublicSettings();
  }, []);

  // Aplicar tema automaticamente baseado nas preferências
  useEffect(() => {
    if (userPreferences.theme) {
      document.documentElement.setAttribute(
        "data-theme",
        userPreferences.theme
      );

      // Também atualizar localStorage para compatibilidade
      localStorage.setItem("theme", userPreferences.theme);
    }
  }, [userPreferences.theme]);

  const value: SettingsContextType = {
    // Configurações do sistema
    systemSettings,
    updateSystemSetting,
    refreshSystemSettings,
    isLoadingSystemSettings,

    // Preferências do usuário
    userPreferences,
    updateUserPreference,
    refreshUserPreferences,
    isLoadingUserPreferences,

    // Configurações públicas
    publicSettings,
    getPublicSetting,

    // Notificações
    sendNotification,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings deve ser usado dentro de um SettingsProvider");
  }
  return context;
}

// Hook específico para configurações do sistema (admin)
export function useSystemSettings() {
  const {
    systemSettings,
    updateSystemSetting,
    refreshSystemSettings,
    isLoadingSystemSettings,
  } = useSettings();
  return {
    systemSettings,
    updateSystemSetting,
    refreshSystemSettings,
    isLoadingSystemSettings,
  };
}

// Hook específico para preferências do usuário
export function useUserPreferences() {
  const {
    userPreferences,
    updateUserPreference,
    refreshUserPreferences,
    isLoadingUserPreferences,
  } = useSettings();
  return {
    userPreferences,
    updateUserPreference,
    refreshUserPreferences,
    isLoadingUserPreferences,
  };
}
