"use client";

import { MobileNavigation } from "@/components/community/mobile-navigation";
import { UserProfile } from "@/components/community/user-profile";
import { NavigationHeader } from "@/components/navigation-header";
import { OfflineIndicator } from "@/components/pwa/offline-indicator";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfilePage() {
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
    <div className="min-h-screen bg-[#0E0E0E]">
      <NavigationHeader title="Perfil" />
      <div className="p-4 bg-[#0E0E0E] min-h-screen pb-20">
        <UserProfile />
      </div>
      <MobileNavigation />
      <OfflineIndicator />
    </div>
  );
}
