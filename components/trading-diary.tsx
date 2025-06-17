"use client"

import { useState } from "react"
import { Calendar } from "@/components/calendar"
import { TradeForm } from "@/components/trade-form"
import { Overview } from "@/components/overview"
import { Button } from "@/components/ui/button"

type Tab = "calendar" | "form" | "overview"

export function TradingDiary() {
  const [activeTab, setActiveTab] = useState<Tab>("calendar")

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Diário de Trading EXL</h1>
        <p className="text-gray-400">Registre e acompanhe suas operações diárias</p>
      </div>

      <nav className="flex justify-center gap-5 mb-8">
        <Button
          onClick={() => setActiveTab("calendar")}
          className={`px-5 py-2.5 font-bold rounded ${
            activeTab === "calendar" ? "bg-[#BBF717] text-[#0E0E0E]" : "bg-[#1C1C1C] text-[#BBF717] hover:bg-[#2C2C2C]"
          }`}
        >
          Calendário
        </Button>
        <Button
          onClick={() => setActiveTab("form")}
          className={`px-5 py-2.5 font-bold rounded ${
            activeTab === "form" ? "bg-[#BBF717] text-[#0E0E0E]" : "bg-[#1C1C1C] text-[#BBF717] hover:bg-[#2C2C2C]"
          }`}
        >
          Inserir Trade
        </Button>
        <Button
          onClick={() => setActiveTab("overview")}
          className={`px-5 py-2.5 font-bold rounded ${
            activeTab === "overview" ? "bg-[#BBF717] text-[#0E0E0E]" : "bg-[#1C1C1C] text-[#BBF717] hover:bg-[#2C2C2C]"
          }`}
        >
          Visão Geral
        </Button>
      </nav>

      {activeTab === "calendar" && <Calendar />}
      {activeTab === "form" && <TradeForm />}
      {activeTab === "overview" && <Overview />}
    </div>
  )
}
