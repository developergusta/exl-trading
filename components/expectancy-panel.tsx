"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

declare global {
  interface Window {
    Chart: any
  }
}

export function ExpectancyPanel() {
  const [portfolio, setPortfolio] = useState("5000")
  const [numTrades, setNumTrades] = useState("10")
  const [winRate, setWinRate] = useState("55")
  const [avgWin, setAvgWin] = useState("55")
  const [avgLoss, setAvgLoss] = useState("20")
  const [summary, setSummary] = useState<any>(null)

  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<any>(null)

  useEffect(() => {
    // Load Chart.js
    const script = document.createElement("script")
    script.src = "https://cdn.jsdelivr.net/npm/chart.js"
    script.onload = () => {
      renderAll()
    }
    document.head.appendChild(script)

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [])

  const calculateSummary = () => {
    const P0 = Number.parseFloat(portfolio)
    const T = Number.parseInt(numTrades)
    const winRateDecimal = Number.parseFloat(winRate) / 100
    const avgWinDecimal = Number.parseFloat(avgWin) / 100
    const avgLossDecimal = Number.parseFloat(avgLoss) / 100

    const wins = Math.round(winRateDecimal * T)
    const losses = T - wins
    const rrr = (avgWinDecimal / avgLossDecimal).toFixed(2)
    const expectancy = winRateDecimal * avgWinDecimal + (1 - winRateDecimal) * -avgLossDecimal
    const endCap = P0 * Math.pow(1 + expectancy, T)
    const profit = endCap - P0
    const compGrowth = ((endCap / P0 - 1) * 100).toFixed(2)
    const nonComp = ((wins * avgWinDecimal + losses * -avgLossDecimal) * 100).toFixed(2)
    const endCapNonComp = P0 * (1 + Number.parseFloat(nonComp) / 100)
    const profitNonComp = endCapNonComp - P0

    return {
      wins,
      losses,
      T,
      rrr,
      endCap,
      profit,
      endCapNonComp,
      profitNonComp,
      compGrowth,
      nonComp,
      expectancy,
      P0,
    }
  }

  const renderChart = (summaryData: any) => {
    if (!window.Chart || !chartRef.current) return

    const { T, expectancy, P0 } = summaryData
    const winRateDecimal = Number.parseFloat(winRate) / 100
    const avgWinDecimal = Number.parseFloat(avgWin) / 100
    const avgLossDecimal = Number.parseFloat(avgLoss) / 100

    const labels = Array.from({ length: T + 1 }, (_, i) => i)
    const dataComp = labels.map((i) => Number.parseFloat((P0 * Math.pow(1 + expectancy, i)).toFixed(2)))
    const dataNonComp = labels.map((i) =>
      Number.parseFloat(
        (P0 + P0 * (winRateDecimal * avgWinDecimal + (1 - winRateDecimal) * -avgLossDecimal) * i).toFixed(2),
      ),
    )

    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext("2d")
    chartInstance.current = new window.Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Crescimento Composto (R$)",
            data: dataComp,
            borderColor: "#BBF717",
            backgroundColor: "transparent",
            fill: false,
            tension: 0.3,
          },
          {
            label: "Crescimento Não Composto (R$)",
            data: dataNonComp,
            borderColor: "#4CAF50",
            backgroundColor: "transparent",
            fill: false,
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            labels: { color: "#FFF" },
          },
        },
        scales: {
          x: {
            title: { display: true, text: "Número de Operações", color: "#FFF" },
            ticks: { color: "#FFF" },
            grid: { color: "#333" },
          },
          y: {
            title: { display: true, text: "Capital (R$)", color: "#FFF" },
            ticks: { color: "#FFF" },
            grid: { color: "#333" },
            beginAtZero: true,
          },
        },
      },
    })
  }

  const generateRRRTable = () => {
    const T = Number.parseInt(numTrades)
    const winRateDecimal = Number.parseFloat(winRate) / 100
    const rewards = [
      4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60,
    ]
    const risks = [
      -2, -3, -4, -5, -6, -7, -8, -9, -10, -11, -12, -13, -14, -15, -16, -17, -18, -19, -20, -21, -22, -23, -24, -25,
      -26, -27, -28, -29, -30,
    ]

    return rewards.slice(0, 10).map((r, i) => {
      const risk = risks[i] !== undefined ? risks[i] : -r / 2
      const wins = Math.round(winRateDecimal * T)
      const losses = T - wins
      const gain = Math.pow(1 + r / 100, wins) * Math.pow(1 + risk / 100, losses) - 1

      return {
        winRate: (winRateDecimal * 100).toFixed(0),
        reward: r,
        risk,
        gain: (gain * 100).toFixed(2),
      }
    })
  }

  const generateTradeDetails = () => {
    const P0 = Number.parseFloat(portfolio)
    const T = Number.parseInt(numTrades)
    const winRateDecimal = Number.parseFloat(winRate) / 100
    const avgWinDecimal = Number.parseFloat(avgWin) / 100
    const avgLossDecimal = Number.parseFloat(avgLoss) / 100

    const trades = []
    let cap = P0

    for (let i = 1; i <= T; i++) {
      const isWin = Math.random() < winRateDecimal
      const pnl = cap * (isWin ? avgWinDecimal : -avgLossDecimal)
      const exitAmt = cap + pnl
      const growth = ((exitAmt / cap - 1) * 100).toFixed(2)

      trades.push({
        number: i,
        initialValue: cap.toFixed(2),
        result: isWin ? "GANHO" : "PERDA",
        pnl: pnl.toFixed(2),
        pnlPercent: ((pnl / cap) * 100).toFixed(2),
        exitValue: exitAmt.toFixed(2),
        finalCapital: exitAmt.toFixed(2),
        growth,
        isWin,
      })

      cap = exitAmt
    }

    return trades
  }

  const renderAll = () => {
    if (!window.Chart) return

    const summaryData = calculateSummary()
    setSummary(summaryData)
    renderChart(summaryData)
  }

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Painel de Expectativa</h1>
        <p className="text-gray-400">Analise a expectativa matemática das suas estratégias</p>
      </div>

      {/* Rest of the component remains the same */}
      {/* Entradas Gerais */}
      <div className="bg-[#2A2B2A] p-5 mb-5 rounded">
        <div className="flex flex-wrap gap-5">
          <div className="flex-1 min-w-[280px]">
            <label className="block mb-2 font-bold">Valor da Carteira (R$)</label>
            <Input
              type="number"
              value={portfolio}
              onChange={(e) => setPortfolio(e.target.value)}
              step="0.01"
              className="w-full p-1.5 bg-[#2A2B2A] border border-black text-white rounded-sm"
            />
          </div>
          <div className="flex-1 min-w-[280px]">
            <label className="block mb-2 font-bold">Número de Operações</label>
            <Input
              type="number"
              value={numTrades}
              onChange={(e) => setNumTrades(e.target.value)}
              className="w-full p-1.5 bg-[#2A2B2A] border border-black text-white rounded-sm"
            />
          </div>
        </div>
      </div>

      {/* Configuração da Estratégia */}
      <div className="bg-[#2A2B2A] p-5 mb-5 rounded">
        <h2 className="text-xl font-bold text-[#BBF717] mb-3">Estratégia</h2>
        <div className="space-y-4">
          <div>
            <label className="block mb-2 font-bold">Taxa de Acerto (%)</label>
            <Input
              type="number"
              value={winRate}
              onChange={(e) => setWinRate(e.target.value)}
              step="0.01"
              className="w-full p-1.5 bg-[#2A2B2A] border border-black text-white rounded-sm"
            />
          </div>
          <div>
            <label className="block mb-2 font-bold">Ganho Médio (%)</label>
            <Input
              type="number"
              value={avgWin}
              onChange={(e) => setAvgWin(e.target.value)}
              step="0.01"
              className="w-full p-1.5 bg-[#2A2B2A] border border-black text-white rounded-sm"
            />
          </div>
          <div>
            <label className="block mb-2 font-bold">Perda Média (%)</label>
            <Input
              type="number"
              value={avgLoss}
              onChange={(e) => setAvgLoss(e.target.value)}
              step="0.01"
              className="w-full p-1.5 bg-[#2A2B2A] border border-black text-white rounded-sm"
            />
          </div>
        </div>
      </div>

      <Button
        onClick={renderAll}
        className="bg-[#BBF717] text-black hover:bg-[#9FD615] font-bold px-5 py-2.5 mb-5 rounded-sm"
      >
        Calcular
      </Button>

      {/* Métricas Resumo */}
      {summary && (
        <div className="bg-[#2A2B2A] p-5 mb-5 rounded flex flex-wrap gap-5">
          <div className="flex-1 min-w-[280px]">
            <strong>Operações Ganhas:</strong> {summary.wins}/{summary.T}
            <br />
            <strong>Operações Perdidas:</strong> {summary.losses}/{summary.T}
            <br />
            <strong>RRR:</strong> {summary.rrr}:1
          </div>
          <div className="flex-1 min-w-[280px]">
            <strong>Capital Final (Composto):</strong> {formatCurrency(summary.endCap)}
            <br />
            <strong>Lucro/Prejuízo (Composto):</strong> {formatCurrency(summary.profit)}
            <br />
            <strong>Capital Final (Não Composto):</strong> {formatCurrency(summary.endCapNonComp)}
            <br />
            <strong>Lucro/Prejuízo (Não Composto):</strong> {formatCurrency(summary.profitNonComp)}
          </div>
          <div className="flex-1 min-w-[280px]">
            <strong>Crescimento Composto:</strong> {summary.compGrowth}%
            <br />
            <strong>Crescimento Não Composto:</strong> {summary.nonComp}%
          </div>
        </div>
      )}

      {/* Gráfico de Expectativa */}
      <div className="bg-[#2A2B2A] p-5 mb-5 rounded">
        <h2 className="text-xl font-bold text-[#BBF717] mb-3">Gráfico de Expectativa</h2>
        <div className="bg-black p-4 rounded" style={{ height: "400px" }}>
          <canvas ref={chartRef} className="w-full h-full"></canvas>
        </div>
      </div>

      {/* Tabela Taxa de Acerto vs Ganho:Risco */}
      <div className="bg-[#2A2B2A] p-5 mb-5 rounded">
        <h2 className="text-xl font-bold text-[#BBF717] mb-3">Taxa de Acerto % vs Ganho:Risco (10 Operações)</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#2A2B2A]">
                <th className="border border-[#2A2B2A] p-1.5 text-center text-white">Acerto %</th>
                <th className="border border-[#2A2B2A] p-1.5 text-center text-white">Ganho %</th>
                <th className="border border-[#2A2B2A] p-1.5 text-center text-white">Risco %</th>
                <th className="border border-[#2A2B2A] p-1.5 text-center text-white">% Ganho/Perda</th>
              </tr>
            </thead>
            <tbody>
              {generateRRRTable().map((row, index) => (
                <tr key={index}>
                  <td className="border border-[#2A2B2A] p-1.5 text-center text-white">{row.winRate}%</td>
                  <td className="border border-[#2A2B2A] p-1.5 text-center text-white">{row.reward}%</td>
                  <td className="border border-[#2A2B2A] p-1.5 text-center text-white">{row.risk}%</td>
                  <td className="border border-[#2A2B2A] p-1.5 text-center text-white">{row.gain}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detalhes das Operações */}
      <div className="bg-[#2A2B2A] p-5 rounded">
        <h2 className="text-xl font-bold text-[#BBF717] mb-3">Detalhes de Operações</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-[#2A2B2A]">
                <th className="border border-[#2A2B2A] p-1.5 text-center text-white">Nº</th>
                <th className="border border-[#2A2B2A] p-1.5 text-center text-white">Valor Inicial (R$)</th>
                <th className="border border-[#2A2B2A] p-1.5 text-center text-white">Resultado</th>
                <th className="border border-[#2A2B2A] p-1.5 text-center text-white">Ganho/Perda (R$)</th>
                <th className="border border-[#2A2B2A] p-1.5 text-center text-white">% G/P</th>
                <th className="border border-[#2A2B2A] p-1.5 text-center text-white">Valor de Saída (R$)</th>
                <th className="border border-[#2A2B2A] p-1.5 text-center text-white">Capital Final (R$)</th>
                <th className="border border-[#2A2B2A] p-1.5 text-center text-white">% Crescimento</th>
              </tr>
            </thead>
            <tbody>
              {generateTradeDetails().map((trade, index) => (
                <tr key={index}>
                  <td className="border border-[#2A2B2A] p-1.5 text-center text-white">{trade.number}</td>
                  <td className="border border-[#2A2B2A] p-1.5 text-center text-white">R$ {trade.initialValue}</td>
                  <td
                    className={`border border-[#2A2B2A] p-1.5 text-center ${trade.isWin ? "text-[#BBF717]" : "text-[#FF4C4C]"}`}
                  >
                    {trade.result}
                  </td>
                  <td className="border border-[#2A2B2A] p-1.5 text-center text-white">R$ {trade.pnl}</td>
                  <td className="border border-[#2A2B2A] p-1.5 text-center text-white">{trade.pnlPercent}%</td>
                  <td className="border border-[#2A2B2A] p-1.5 text-center text-white">R$ {trade.exitValue}</td>
                  <td className="border border-[#2A2B2A] p-1.5 text-center text-white">R$ {trade.finalCapital}</td>
                  <td className="border border-[#2A2B2A] p-1.5 text-center text-white">{trade.growth}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
