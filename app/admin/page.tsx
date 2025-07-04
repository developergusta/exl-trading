"use client";

import { AdminPanel } from "@/components/auth/admin-panel";
import { OfflineIndicator } from "@/components/pwa/offline-indicator";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminPage() {
  const { user, isAuthenticated, isAdmin, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Só faz redirecionamento após o loading inicial terminar
    if (isLoading) return;

    if (!isAuthenticated) {
      router.push("/auth/login?admin=true");
      return;
    }

    if (!isAdmin) {
      router.push("/dashboard");
      return;
    }

    if (user?.status !== "approved") {
      router.push("/auth/login?admin=true");
      return;
    }
  }, [isAuthenticated, isAdmin, user, router, isLoading]);

  // Loading state while checking authentication
  if (
    isLoading ||
    !isAuthenticated ||
    !isAdmin ||
    user?.status !== "approved"
  ) {
    return (
      <div className="min-h-screen bg-[#0E0E0E] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#BBF717]"></div>
      </div>
    );
  }

  return (
    <>
      <AdminPanel
        onBack={() => {
          router.push("/dashboard");
        }}
      />
      <OfflineIndicator />
    </>
  );
}
