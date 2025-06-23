"use client";

import { NotificationWelcomePrompt } from "@/components/pwa/notification-welcome-prompt";
import { useAuth } from "@/hooks/use-auth";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function HomePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);
  const [isPromptDismissed, setIsPromptDismissed] = useState(false);
  const pushNotifications = usePushNotifications(user?.id);

  // Verifica se o usuário já optou por pular as notificações
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasSkippedNotifications =
        localStorage.getItem("exl-trading-notifications-skipped") === "true";
      setIsPromptDismissed(hasSkippedNotifications);
    }
  }, []);

  useEffect(() => {
    // Só faz verificação após o loading inicial terminar
    if (isLoading) return;

    // Se não está autenticado, redireciona para login imediatamente
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    // Se está autenticado mas pendente, redireciona para pending
    if (user?.status === "pending") {
      router.push("/pending");
      return;
    }

    // Se está autenticado e aprovado, verifica se deve mostrar prompt de notificação
    if (user?.status === "approved") {
      // Verifica se o navegador suporta notificações e se ainda não foi solicitada permissão
      if (
        pushNotifications.isSupported &&
        !pushNotifications.hasPermission &&
        !isPromptDismissed
      ) {
        // Mostra o prompt após 1 segundo para dar tempo da tela carregar
        const timer = setTimeout(() => {
          setShowNotificationPrompt(true);
        }, 1000);

        return () => clearTimeout(timer);
      } else {
        // Se já tem permissão ou não suporta, redireciona para dashboard
        router.push("/dashboard");
      }
    }
  }, [
    isAuthenticated,
    user,
    router,
    isLoading,
    pushNotifications.isSupported,
    pushNotifications.hasPermission,
    isPromptDismissed,
  ]);

  const handlePermissionGranted = () => {
    setShowNotificationPrompt(false);
    // Remove o flag de "pulado" se existir, já que o usuário ativou
    if (typeof window !== "undefined") {
      localStorage.removeItem("exl-trading-notifications-skipped");
    }
    // Pequeno delay para mostrar que foi processado e melhorar UX
    setTimeout(() => {
      router.push("/dashboard");
    }, 500);
  };

  const handleSkip = () => {
    setIsPromptDismissed(true);
    setShowNotificationPrompt(false);

    // Salva a preferência do usuário para não incomodar novamente nesta sessão
    if (typeof window !== "undefined") {
      localStorage.setItem("exl-trading-notifications-skipped", "true");
    }

    router.push("/dashboard");
  };

  // Loading spinner enquanto determina a rota ou mostra o prompt
  if (
    isLoading ||
    (!showNotificationPrompt && isAuthenticated && user?.status === "approved")
  ) {
    return (
      <div className="min-h-screen bg-[#0E0E0E] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#BBF717]"></div>
      </div>
    );
  }

  // Mostra prompt de notificação se necessário
  if (showNotificationPrompt) {
    return (
      <NotificationWelcomePrompt
        userId={user?.id}
        onPermissionGranted={handlePermissionGranted}
        onSkip={handleSkip}
      />
    );
  }

  // Fallback loading (não deveria aparecer em condições normais)
  return (
    <div className="min-h-screen bg-[#0E0E0E] text-white flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#BBF717]"></div>
    </div>
  );
}
