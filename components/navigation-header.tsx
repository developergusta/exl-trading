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
    <div className="sticky top-0 z-10 bg-[#1C1C1C] border-b border-[#2C2C2C] shadow-lg">
      <div className="flex justify-between items-center p-4 max-w-screen-xl mx-auto">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {showBackButton && (
            <Button
              onClick={handleBack}
              size="sm"
              className="bg-[#2C2C2C] text-[#BBF717] hover:bg-[#3C3C3C] flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Voltar ao Hub</span>
              <span className="sm:hidden">Voltar</span>
            </Button>
          )}
          {title && (
            <h1 className="text-lg sm:text-2xl font-bold text-white truncate">
              {title}
            </h1>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {isAdmin && (
            <Button
              onClick={handleAdminClick}
              size="sm"
              className="bg-[#BBF717] text-black hover:bg-[#9FD615] border-none font-medium"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">Admin</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
