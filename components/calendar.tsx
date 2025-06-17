"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useTrades } from "@/hooks/use-trades"

const months = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
]

export function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear] = useState(2025)
  const { trades, getTotalPL, getBestDay, getWorstDay, getWinRate } = useTrades()

  const changeMonth = (delta: number) => {
    setCurrentMonth((prev) => (prev + delta + 12) % 12)
  }

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay()
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear)
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear)
    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="day"></div>)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
      const trade = trades.find((t) => t.date === dateKey)

      let dayClass = "day bg-[#1C1C1C] rounded-lg p-2.5 text-center min-h-[60px] flex flex-col justify-center"

      if (trade) {
        const result = Number.parseFloat(trade.pl)
        if (result >= 0) {
          dayClass += " bg-[#BBF71722] border border-[#BBF717]"
        } else {
          dayClass += " bg-[#FF4C4C22] border border-[#FF4C4C]"
        }
      }

      days.push(
        <div key={day} className={dayClass}>
          <span className="text-sm font-bold">{String(day).padStart(2, "0")}</span>
          {trade && (
            <div className="text-xs mt-1">
              {Number.parseFloat(trade.pl).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </div>
          )}
        </div>,
      )
    }

    return days
  }

  return (
    <div>
      {/* Summary */}
      <div className="max-w-4xl mx-auto mb-5 flex flex-wrap justify-between gap-4 p-5 bg-[#1C1C1C] rounded-lg">
        <div className="flex-1 min-w-[150px] text-center">
          <label className="block font-bold text-[#BBF717] mb-1">P&L Total</label>
          <span>{getTotalPL().toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
        </div>
        <div className="flex-1 min-w-[150px] text-center">
          <label className="block font-bold text-[#BBF717] mb-1">Melhor Dia</label>
          <span>{getBestDay()}</span>
        </div>
        <div className="flex-1 min-w-[150px] text-center">
          <label className="block font-bold text-[#BBF717] mb-1">Pior Dia</label>
          <span>{getWorstDay()}</span>
        </div>
        <div className="flex-1 min-w-[150px] text-center">
          <label className="block font-bold text-[#BBF717] mb-1">Win Rate</label>
          <span>{getWinRate()}%</span>
        </div>
      </div>

      {/* Month Navigation */}
      <div className="flex justify-center items-center gap-2.5 mb-2.5">
        <Button onClick={() => changeMonth(-1)} variant="ghost" size="sm" className="text-[#BBF717] hover:bg-[#1C1C1C]">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="text-center text-xl text-[#BBF717] font-bold min-w-[120px]">{months[currentMonth]}</div>
        <Button onClick={() => changeMonth(1)} variant="ghost" size="sm" className="text-[#BBF717] hover:bg-[#1C1C1C]">
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 max-w-4xl mx-auto">
        {/* Day headers */}
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
          <div key={day} className="text-center font-bold text-[#BBF717] p-2">
            {day}
          </div>
        ))}
        {renderCalendar()}
      </div>
    </div>
  )
}
