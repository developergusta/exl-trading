"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { WifiOff, Wifi } from "lucide-react"

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [showOfflineMessage, setShowOfflineMessage] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setShowOfflineMessage(false)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowOfflineMessage(true)
    }

    // Set initial state
    setIsOnline(navigator.onLine)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  if (!showOfflineMessage && isOnline) {
    return null
  }

  return (
    <Card
      className={`fixed bottom-4 left-4 right-4 z-50 shadow-lg md:left-auto md:right-4 md:w-80 ${
        isOnline ? "bg-green-600 border-green-500" : "bg-red-600 border-red-500"
      }`}
    >
      <CardContent className="p-3">
        <div className="flex items-center gap-2">
          {isOnline ? <Wifi className="w-5 h-5 text-white" /> : <WifiOff className="w-5 h-5 text-white" />}
          <div className="text-white">
            <p className="font-medium text-sm">{isOnline ? "Conexão restaurada!" : "Você está offline"}</p>
            <p className="text-xs opacity-90">
              {isOnline ? "Todos os recursos estão disponíveis" : "Algumas funcionalidades podem estar limitadas"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
