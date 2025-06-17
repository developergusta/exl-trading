"use client";

import { MobileNavigation } from "@/components/community/mobile-navigation";
import { TradingHub } from "@/components/trading-hub";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";

export function MobileApp() {
  const { isAdmin } = useAuth();
  const router = useRouter();

  const handleAdminClick = () => {
    router.push("/admin");
  };

  return (
    <div className="min-h-screen bg-[#0E0E0E]">
      <div className="pb-20">
        <TradingHub onAdminClick={handleAdminClick} />
      </div>
      <MobileNavigation />
    </div>
  );
}
