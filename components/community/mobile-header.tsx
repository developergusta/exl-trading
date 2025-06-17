"use client"

import { Button } from "@/components/ui/button"
import { Bell } from "lucide-react"

interface MobileHeaderProps {
  title: string
  showNotifications?: boolean
}

export function MobileHeader({ title, showNotifications = true }: MobileHeaderProps) {
  return (
    <div className="sticky top-0 bg-[#2C2C2C] text-white z-40 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/images/exl-logo.png" alt="EXL Trading" className="w-auto h-8 object-contain" />
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>
        {showNotifications && (
          <Button variant="ghost" size="sm" className="text-white p-2">
            <Bell className="w-5 h-5" />
          </Button>
        )}
      </div>
    </div>
  )
}
