"use client"

import { useState, useEffect } from "react"
import { LoginForm } from "@/components/auth/login-form"
import { RegisterForm } from "@/components/auth/register-form"
import { AdminPanel } from "@/components/auth/admin-panel"
import { MobileApp } from "@/components/mobile-app"
import { InstallPrompt } from "@/components/pwa/install-prompt"
import { OfflineIndicator } from "@/components/pwa/offline-indicator"
import { useAuth } from "@/hooks/use-auth"
import { usePWA } from "@/hooks/use-pwa"

export default function App() {
  const { user, isAuthenticated, isAdmin } = useAuth()
  const { updateAvailable, updateApp } = usePWA()
  const [authMode, setAuthMode] = useState<"login" | "register" | "admin">("login")
  const [isAdminMode, setIsAdminMode] = useState(false)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get("admin") === "true") {
      setIsAdminMode(true)
    }
  }, [])

  if (isAuthenticated && user?.status === "approved") {
    if (isAdmin && (authMode === "admin" || isAdminMode)) {
      return (
        <>
          <AdminPanel
            onBack={() => {
              setAuthMode("login")
              setIsAdminMode(false)
              window.history.pushState({}, "", "/")
            }}
          />
          <OfflineIndicator />
        </>
      )
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
    )
  }

  return (
    <div className="min-h-screen bg-[#0E0E0E] text-white flex items-center justify-center p-5">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/images/exl-logo.png" alt="EXL Trading Logo" className="h-16 w-auto object-contain mx-auto mb-4" />
          <h1 className="text-2xl font-bold">EXL Trading Hub</h1>
          <p className="text-gray-400 mt-2">Acesso restrito para traders aprovados</p>
        </div>

        {/* Auth Forms */}
        {authMode === "login" && (
          <LoginForm onSwitchToRegister={() => setAuthMode("register")} onSwitchToAdmin={() => setAuthMode("admin")} />
        )}

        {authMode === "register" && <RegisterForm onSwitchToLogin={() => setAuthMode("login")} />}

        {authMode === "admin" && !isAuthenticated && (
          <LoginForm
            isAdminMode={true}
            onSwitchToRegister={() => setAuthMode("register")}
            onBack={() => setAuthMode("login")}
          />
        )}

        {/* Status Message for Pending Users */}
        {isAuthenticated && user?.status === "pending" && (
          <div className="bg-[#1C1C1C] p-6 rounded-lg border border-yellow-500 text-center">
            <h3 className="text-yellow-500 font-bold mb-2">Conta Pendente de Aprovação</h3>
            <p className="text-gray-300 text-sm">
              Sua conta foi criada com sucesso, mas ainda precisa ser aprovada por um administrador. Você receberá
              acesso assim que sua conta for liberada.
            </p>
          </div>
        )}
      </div>

      <InstallPrompt />
      <OfflineIndicator />
    </div>
  )
}
