"use client";

import { InstallPrompt } from "@/components/pwa/install-prompt";
import { OfflineIndicator } from "@/components/pwa/offline-indicator";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PendingPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Só faz redirecionamento após o loading inicial terminar
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (user?.status === "approved") {
      router.push("/dashboard");
      return;
    }

    if (user?.status !== "pending") {
      router.push("/auth/login");
      return;
    }
  }, [isAuthenticated, user, router, isLoading]);

  // Loading state while checking authentication
  if (isLoading || !isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-[#0E0E0E] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#BBF717]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0E0E0E] text-white flex items-center justify-center p-5">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img
            src="/images/exl-logo.png"
            alt="EXL Trading Logo"
            className="h-16 w-auto object-contain mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold">EXL Trading Hub</h1>
          <p className="text-gray-400 mt-2">
            Acesso restrito para traders aprovados
          </p>
          <InstallPrompt />
        </div>

        {/* Status Message for Pending Users */}
        <div className="bg-[#1C1C1C] p-6 rounded-lg border border-yellow-500 text-center">
          <h3 className="text-yellow-500 font-bold mb-2">
            Conta Pendente de Aprovação
          </h3>
          <p className="text-gray-300 text-sm mb-4">
            Sua conta foi criada com sucesso, mas ainda precisa ser aprovada por
            um administrador. Você receberá acesso assim que sua conta for
            liberada.
          </p>
          <button
            onClick={() => {
              localStorage.removeItem("currentUser");
              router.push("/auth/login");
            }}
            className="text-[#BBF717] hover:underline text-sm"
          >
            Sair da conta
          </button>
        </div>
      </div>

      <OfflineIndicator />
    </div>
  );
}
