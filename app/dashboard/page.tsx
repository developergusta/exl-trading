"use client";

import { AdminPanel } from "@/components/auth/admin-panel";
import { MobileApp } from "@/components/mobile-app";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { OfflineIndicator } from "@/components/pwa/offline-indicator";
import { useAuth } from "@/hooks/use-auth";
import { usePWA } from "@/hooks/use-pwa";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const { user, isAuthenticated, isAdmin, isLoading } = useAuth();
  const { updateAvailable, updateApp } = usePWA();
  const [isAdminMode, setIsAdminMode] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Só faz redirecionamento após o loading inicial terminar
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (user?.status === "pending") {
      router.push("/pending");
      return;
    }

    if (user?.status !== "approved") {
      router.push("/auth/login");
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("admin") === "true" && isAdmin) {
      setIsAdminMode(true);
    }
  }, [isAuthenticated, user, isAdmin, router, isLoading]);

  // Loading state while checking authentication
  if (isLoading || !isAuthenticated || user?.status !== "approved") {
    return (
      <div className="min-h-screen bg-[#0E0E0E] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#BBF717]"></div>
      </div>
    );
  }

  if (isAdmin && isAdminMode) {
    return (
      <>
        <AdminPanel
          onBack={() => {
            setIsAdminMode(false);
            router.push("/dashboard");
          }}
        />
        <OfflineIndicator />
      </>
    );
  }

  return (
    <>
      <MobileApp />
      <InstallPrompt />
      <OfflineIndicator />
      {updateAvailable && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-[#BBF717] text-black px-4 py-2 rounded-lg shadow-lg">
            <p className="text-sm font-medium">Nova versão disponível!</p>
            <button onClick={updateApp} className="text-xs underline">
              Atualizar agora
            </button>
          </div>
        </div>
      )}
    </>
  );
}
