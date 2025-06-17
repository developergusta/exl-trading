"use client"

import { useEffect, useRef } from "react"
import { useTrades } from "@/hooks/use-trades"

declare global {
  interface Window {
    Chart: any
  }
}

export function Overview() {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstanceRef = useRef<any>(null)
  const { trades, getTotalPL, getTotalTrades, getProfitDays, getLossDays, getWinRate } = useTrades()

  useEffect(() => {
    // Load Chart.js
    const script = document.createElement("script")
    script.src = "https://cdn.jsdelivr.net/npm/chart.js"
    script.onload = () => {
      renderChart()
    }
    document.head.appendChild(script)

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy()
      }
    }
  }, [trades])

  const renderChart = () => {
    if (!chartRef.current || !window.Chart) return

    const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
    const data = Array(12).fill(0)

    trades.forEach((trade) => {
      const month = Number.parseInt(trade.date.split("-")[1]) - 1
      data[month] += Number.parseFloat(trade.pl)
    })

    // Calculate cumulative data
    for (let i = 1; i < 12; i++) {
      data[i] += data[i - 1]
    }

    const ctx = chartRef.current.getContext("2d")

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy()
    }

    chartInstanceRef.current = new window.Chart(ctx, {
      type: "line",
      data: {
        labels: months,
        datasets: [
          {
            label: "P&L Acumulado",
            data: data,
            borderColor: "#BBF717",
            backgroundColor: "transparent",
            fill: false,
            tension: 0.3,
            pointBackgroundColor: "#BBF717",
            pointBorderColor: "#BBF717",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: "#FFF",
            },
          },
        },
        scales: {
          x: {
            ticks: {
              color: "#FFF",
            },
            grid: {
              color: "#333",
            },
          },
          y: {
            ticks: {
              color: "#FFF",
              callback: (value: any) => "R$ " + value.toLocaleString("pt-BR"),
            },
            grid: {
              color: "#333",
            },
          },
        },
      },
    })
  }

  return (
    <div className="max-w-4xl mx-auto bg-[#1C1C1C] p-5 rounded-lg">
      <h2 className="text-2xl font-bold text-[#BBF717] mb-5">Visão Geral</h2>

      <div className="flex flex-wrap justify-center gap-5 mb-5 text-center">
        <p className="min-w-[120px]">
          <strong>Operações:</strong> <span>{getTotalTrades()}</span>
        </p>
        <p className="min-w-[120px]">
          <strong>Positivos:</strong> <span>{getProfitDays()}</span>
        </p>
        <p className="min-w-[120px]">
          <strong>Negativos:</strong> <span>{getLossDays()}</span>
        </p>
        <p className="min-w-[120px]">
          <strong>P&L:</strong>{" "}
          <span>{getTotalPL().toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
        </p>
        <p className="min-w-[120px]">
          <strong>Win Rate:</strong> <span>{getWinRate()}%</span>
        </p>
      </div>

      <div className="bg-[#0E0E0E] rounded-lg p-4" style={{ height: "400px" }}>
        <canvas ref={chartRef} className="w-full h-full"></canvas>
      </div>
    </div>
  )
}
