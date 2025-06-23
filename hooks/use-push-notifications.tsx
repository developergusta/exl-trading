"use client";

import { PushNotification, pushService } from "@/lib/push-service";
import { useCallback, useEffect, useState } from "react";

export interface UsePushNotificationsReturn {
  isSupported: boolean;
  hasPermission: boolean;
  isSubscribed: boolean;
  isLoading: boolean;
  error: string | null;
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
  sendTestNotification: (notification: PushNotification) => Promise<void>;
  requestPermission: () => Promise<boolean>;
  checkStatus: () => Promise<void>;
}

export function usePushNotifications(
  userId?: string
): UsePushNotificationsReturn {
  const [isSupported, setIsSupported] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verifica status inicial
  const checkStatus = useCallback(async () => {
    try {
      setError(null);
      const supported = pushService.isSupported();
      setIsSupported(supported);

      if (supported) {
        const permission = await pushService.hasPermission();
        setHasPermission(permission);

        const subscriptionStatus = await pushService.checkSubscriptionStatus();
        setIsSubscribed(subscriptionStatus);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao verificar status");
      console.error("Erro ao verificar status:", err);
    }
  }, []);

  // Solicita permissão
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const granted = await pushService.requestPermission();
      setHasPermission(granted);

      if (!granted) {
        setError("Permissão negada para notificações");
      }

      return granted;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao solicitar permissão";
      setError(errorMessage);
      console.error("Erro ao solicitar permissão:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Inscreve o usuário
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!userId) {
      setError("User ID é obrigatório para subscription");
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);

      const subscription = await pushService.subscribe(userId);

      if (subscription) {
        setIsSubscribed(true);
        console.log("Subscription criada:", subscription);
        return true;
      } else {
        setError("Falha ao criar subscription");
        return false;
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao criar subscription";
      setError(errorMessage);
      console.error("Erro ao criar subscription:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Cancela a inscrição
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!userId) {
      setError("User ID é obrigatório para unsubscribe");
      return false;
    }

    try {
      setIsLoading(true);
      setError(null);

      const success = await pushService.unsubscribe(userId);

      if (success) {
        setIsSubscribed(false);
        console.log("Subscription removida");
        return true;
      } else {
        setError("Falha ao remover subscription");
        return false;
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao remover subscription";
      setError(errorMessage);
      console.error("Erro ao remover subscription:", err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Envia notificação de teste
  const sendTestNotification = useCallback(
    async (notification: PushNotification): Promise<void> => {
      try {
        setError(null);
        await pushService.sendLocalNotification(notification);
        console.log("Notificação de teste enviada");
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Erro ao enviar notificação de teste";
        setError(errorMessage);
        console.error("Erro ao enviar notificação de teste:", err);
        throw err;
      }
    },
    []
  );

  // Verifica status quando o componente monta
  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  // Verifica status quando userId muda
  useEffect(() => {
    if (userId) {
      checkStatus();
    }
  }, [userId, checkStatus]);

  return {
    isSupported,
    hasPermission,
    isSubscribed,
    isLoading,
    error,
    subscribe,
    unsubscribe,
    sendTestNotification,
    requestPermission,
    checkStatus,
  };
}
