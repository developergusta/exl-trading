"use client";

import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { OfflineIndicator } from "@/components/pwa/offline-indicator";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const { isAuthenticated, user, isLoading } = useAuth();
  const [authMode, setAuthMode] = useState<"login" | "register" | "admin">(
    "login"
  );
  const router = useRouter();

  useEffect(() => {
    // Só faz redirecionamento após o loading inicial terminar
    if (isLoading) return;

    if (isAuthenticated && user?.status === "approved") {
      router.push("/dashboard");
    } else if (isAuthenticated && user?.status === "pending") {
      router.push("/pending");
    }

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("admin") === "true") {
      setAuthMode("admin");
    }
  }, [isAuthenticated, user, router, isLoading]);

  // Mostra loading enquanto verifica autenticação
  if (isLoading) {
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

        {/* Auth Forms */}
        {authMode === "login" && (
          <LoginForm
            onSwitchToRegister={() => setAuthMode("register")}
            onSwitchToAdmin={() => setAuthMode("admin")}
          />
        )}

        {authMode === "register" && (
          <RegisterForm onSwitchToLogin={() => setAuthMode("login")} />
        )}

        {authMode === "admin" && (
          <LoginForm
            isAdminMode={true}
            onSwitchToRegister={() => setAuthMode("register")}
            onBack={() => setAuthMode("login")}
          />
        )}
      </div>

      <OfflineIndicator />
    </div>
  );
}
