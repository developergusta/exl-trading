"use client";

import { ExpectancyPanel } from "@/components/expectancy-panel";
import { OfflineIndicator } from "@/components/pwa/offline-indicator";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ExpectancyPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
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
  }, [isAuthenticated, user, router, isLoading]);

  // Loading state while checking authentication
  if (isLoading || !isAuthenticated || user?.status !== "approved") {
    return (
      <div className="min-h-screen bg-[#0E0E0E] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#BBF717]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0E0E0E] text-white p-5">
      <div className="max-w-6xl mx-auto">
        <ExpectancyPanel />
      </div>
      <OfflineIndicator />
    </div>
  );
}
