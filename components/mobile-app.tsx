"use client"

import { useState } from "react"
import { TradingHub } from "@/components/trading-hub"
import { CommunityFeed } from "@/components/community/community-feed"
import { CompanyFeed } from "@/components/community/company-feed"
import { MobileNavigation } from "@/components/community/mobile-navigation"
import { MobileHeader } from "@/components/community/mobile-header"
import { UserProfile } from "@/components/community/user-profile"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { useAuth } from "@/hooks/use-auth"

type MobileTab = "home" | "feed" | "community" | "profile" | "admin"

export function MobileApp() {
  const [activeTab, setActiveTab] = useState<MobileTab>("home")
  const { isAdmin } = useAuth()

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <TradingHub onAdminClick={() => setActiveTab("admin")} />
      case "feed":
        return (
          <div className="pb-20">
            <MobileHeader title="Atualizações" />
            <div className="p-4 bg-[#0E0E0E] min-h-screen">
              <CompanyFeed />
            </div>
          </div>
        )
      case "community":
        return (
          <div className="pb-20">
            <MobileHeader title="Comunidade" />
            <div className="p-4 bg-[#0E0E0E] min-h-screen">
              <CommunityFeed />
            </div>
          </div>
        )
      case "profile":
        return (
          <div className="pb-20">
            <MobileHeader title="Perfil" showNotifications={false} />
            <div className="p-4 bg-[#0E0E0E] min-h-screen">
              <UserProfile />
            </div>
          </div>
        )
      case "admin":
        if (!isAdmin) {
          setActiveTab("home")
          return null
        }
        return <AdminDashboard onBack={() => setActiveTab("home")} />
      default:
        return <TradingHub onAdminClick={() => setActiveTab("admin")} />
    }
  }

  return (
    <div className="min-h-screen bg-[#0E0E0E]">
      {renderContent()}
      {activeTab !== "admin" && <MobileNavigation activeTab={activeTab as any} onTabChange={setActiveTab as any} />}
    </div>
  )
}
