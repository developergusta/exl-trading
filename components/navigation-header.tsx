"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { ArrowLeft, Settings } from "lucide-react";
import { useRouter } from "next/navigation";

interface NavigationHeaderProps {
  title?: string;
  showBackButton?: boolean;
  backPath?: string;
}

export function NavigationHeader({
  title,
  showBackButton = true,
  backPath = "/dashboard",
}: NavigationHeaderProps) {
  const { user, logout, isAdmin } = useAuth();
  const router = useRouter();

  const handleBack = () => {
    router.push(backPath);
  };

  const handleAdminClick = () => {
    router.push("/admin");
  };

  return (
    <div className="flex justify-between items-center mb-8 p-5 bg-[#1C1C1C] border-b border-[#2C2C2C]">
      <div className="flex items-center gap-4">
        {showBackButton && (
          <Button
            onClick={handleBack}
            className="bg-[#2C2C2C] text-[#BBF717] hover:bg-[#3C3C3C]"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Hub
          </Button>
        )}
        {title && <h1 className="text-2xl font-bold text-white">{title}</h1>}
      </div>

      <div className="flex items-center gap-3">
        {isAdmin && (
          <Button
            onClick={handleAdminClick}
            size="sm"
            className="bg-[#BBF717] text-black hover:bg-[#9FD615] border-none font-medium"
          >
            <Settings className="h-4 w-4 mr-2" />
            Admin
          </Button>
        )}
      </div>
    </div>
  );
}
