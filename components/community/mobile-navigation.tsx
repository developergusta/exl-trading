"use client"

import { Button } from "@/components/ui/button"
import { Home, MessageSquare, Users, User } from "lucide-react"

interface MobileNavigationProps {
  activeTab: "home" | "feed" | "community" | "profile"
  onTabChange: (tab: "home" | "feed" | "community" | "profile") => void
}

export function MobileNavigation({ activeTab, onTabChange }: MobileNavigationProps) {
  const tabs = [
    { id: "home" as const, label: "Início", icon: Home },
    { id: "feed" as const, label: "Feed", icon: MessageSquare },
    { id: "community" as const, label: "Comunidade", icon: Users },
    { id: "profile" as const, label: "Perfil", icon: User },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#1C1C1C] border-t border-[#2C2C2C] z-50">
      <div className="flex">
        {tabs.map((tab) => {
          const IconComponent = tab.icon
          const isActive = activeTab === tab.id

          return (
            <Button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              variant="ghost"
              className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 rounded-none h-auto ${
                isActive ? "text-[#BBF717] bg-[#2C2C2C]" : "text-gray-400 hover:text-gray-200 hover:bg-[#2C2C2C]"
              }`}
            >
              <IconComponent className="w-5 h-5" />
              <span className="text-xs font-medium">{tab.label}</span>
              {isActive && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-[#BBF717] rounded-full"></div>
              )}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
