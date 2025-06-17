"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Só faz redirecionamento após o loading inicial terminar
    if (isLoading) return;

    if (isAuthenticated && user?.status === "approved") {
      router.push("/dashboard");
    } else if (isAuthenticated && user?.status === "pending") {
      router.push("/pending");
    } else {
      router.push("/auth/login");
    }
  }, [isAuthenticated, user, router, isLoading]);

  // Loading spinner enquanto determina a rota
  return (
    <div className="min-h-screen bg-[#0E0E0E] text-white flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#BBF717]"></div>
    </div>
  );
}
