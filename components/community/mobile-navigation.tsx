"use client";

import { Button } from "@/components/ui/button";
import { DollarSign, Home, MessageSquare, User, Users } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import React from "react";

export function MobileNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const [showPlans, setShowPlans] = React.useState(false);

  const tabs = [
    { id: "home", label: "Início", icon: Home, path: "/dashboard" },
    { id: "feed", label: "Feed", icon: MessageSquare, path: "/dashboard/feed" },
    {
      id: "community",
      label: "Comunidade",
      icon: Users,
      path: "/dashboard/community",
    },
    { id: "profile", label: "Perfil", icon: User, path: "/dashboard/profile" },
    { id: "plans", label: "Planos", icon: DollarSign, path: null },
  ];

  const getActiveTab = () => {
    if (showPlans) return "plans";
    const currentTab = tabs.find((tab) => pathname === tab.path);
    return currentTab ? currentTab.id : "home";
  };

  const activeTab = getActiveTab();

  return (
    <>
      {showPlans && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col">
          <div className="flex justify-end p-2">
            <Button variant="ghost" onClick={() => setShowPlans(false)}>
              Fechar
            </Button>
          </div>
          <iframe
            src="https://v0-exltradereport-3q.vercel.app/#planos"
            title="Planos EXL"
            className="flex-1 w-full border-none"
            style={{ minHeight: 0, overflow: "hidden" }}
          />
        </div>
      )}
      <div className="fixed bottom-0 left-0 right-0 bg-[#1C1C1C] border-t border-[#2C2C2C] z-50">
        <div className="flex">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <Button
                key={tab.id}
                onClick={() => {
                  if (tab.id === "plans") {
                    setShowPlans(true);
                  } else {
                    setShowPlans(false);
                    if (typeof tab.path === "string" && tab.path) {
                      router.push(tab.path);
                    }
                  }
                }}
                variant="ghost"
                className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 rounded-none h-auto ${
                  isActive
                    ? "text-[#BBF717] bg-[#2C2C2C]"
                    : "text-gray-400 hover:text-gray-200 hover:bg-[#2C2C2C]"
                }`}
              >
                <IconComponent className="w-5 h-5" />
                <span className="text-xs font-medium">{tab.label}</span>
                {isActive && (
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-[#BBF717] rounded-full"></div>
                )}
              </Button>
            );
          })}
        </div>
      </div>
    </>
  );
}
