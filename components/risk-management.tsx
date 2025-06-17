"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface RiskCalculation {
  riskPerTrade: number
  maxDailyLoss: number
  dailyRiskPerTrade: number
}

export function RiskManagement() {
  const [portfolio, setPortfolio] = useState("100000")
  const [dailyMaxPct, setDailyMaxPct] = useState("2")
  const [tradePct, setTradePct] = useState("0.5")
  const [tradesDay, setTradesDay] = useState("4")
  const [results, setResults] = useState<RiskCalculation | null>(null)

  const calculateRisk = () => {
    const P = Number.parseFloat(portfolio) || 0
    const dPct = Number.parseFloat(dailyMaxPct) / 100
    const tPct = Number.parseFloat(tradePct) / 100
    const n = Number.parseInt(tradesDay) || 1

    const riskPerTrade = P * tPct
    const maxDailyLoss = P * dPct
    const dailyRiskPerTrade = maxDailyLoss / n

    setResults({
      riskPerTrade,
      maxDailyLoss,
      dailyRiskPerTrade,
    })
  }

  // Calculate on component mount and when values change
  useEffect(() => {
    calculateRisk()
  }, [portfolio, dailyMaxPct, tradePct, tradesDay])

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Gestão de Risco</h1>
        <p className="text-gray-400">Calcule e gerencie seus riscos por operação</p>
      </div>

      {/* Rest of the component remains the same */}
      {/* Input Section */}
      <div className="bg-[#2A2B2A] p-5 mb-5 rounded">
        <div className="flex flex-wrap gap-5">
          <div className="flex-1 min-w-[200px]">
            <label className="block mb-2 font-bold">Valor da Carteira (R$)</label>
            <Input
              type="number"
              value={portfolio}
              onChange={(e) => setPortfolio(e.target.value)}
              step="0.01"
              className="w-full p-1.5 bg-black border border-[#555] text-white rounded-sm"
            />
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block mb-2 font-bold">Risco Máximo Diário (%)</label>
            <Input
              type="number"
              value={dailyMaxPct}
              onChange={(e) => setDailyMaxPct(e.target.value)}
              step="0.01"
              className="w-full p-1.5 bg-black border border-[#555] text-white rounded-sm"
            />
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block mb-2 font-bold">Risco por Trade (%)</label>
            <Input
              type="number"
              value={tradePct}
              onChange={(e) => setTradePct(e.target.value)}
              step="0.01"
              className="w-full p-1.5 bg-black border border-[#555] text-white rounded-sm"
            />
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block mb-2 font-bold">Trades por Dia</label>
            <Input
              type="number"
              value={tradesDay}
              onChange={(e) => setTradesDay(e.target.value)}
              className="w-full p-1.5 bg-black border border-[#555] text-white rounded-sm"
            />
          </div>
        </div>

        <Button
          onClick={calculateRisk}
          className="bg-[#BBF717] text-black hover:bg-[#9FD615] font-bold px-5 py-2.5 mt-2.5 rounded-sm"
        >
          Calcular Gestão de Risco
        </Button>
      </div>

      {/* Results Section */}
      {results && (
        <div className="space-y-2.5">
          <div className="bg-black p-2.5 rounded-sm">
            <span className="font-bold text-[#BBF717]">Risco por Trade (R$):</span> R$ {results.riskPerTrade.toFixed(2)}
          </div>

          <div className="bg-black p-2.5 rounded-sm">
            <span className="font-bold text-[#BBF717]">Perda Máxima Diária (R$):</span> R${" "}
            {results.maxDailyLoss.toFixed(2)}
          </div>

          <div className="bg-black p-2.5 rounded-sm">
            <span className="font-bold text-[#BBF717]">Risco Diário por Trade (R$):</span> R${" "}
            {results.dailyRiskPerTrade.toFixed(2)}
          </div>
        </div>
      )}

      {/* Additional Risk Management Tips */}
      <div className="bg-[#2A2B2A] p-5 mt-5 rounded">
        <h3 className="text-lg font-bold text-[#BBF717] mb-3">Dicas de Gestão de Risco</h3>
        <ul className="space-y-2 text-sm">
          <li>
            • <strong>Regra dos 2%:</strong> Nunca arrisque mais de 2% do seu capital em um único dia
          </li>
          <li>
            • <strong>Stop Loss:</strong> Sempre defina seu stop loss antes de entrar na operação
          </li>
          <li>
            • <strong>Posição Sizing:</strong> Calcule o tamanho da posição baseado no seu risco por trade
          </li>
          <li>
            • <strong>Diversificação:</strong> Não concentre todo o risco em um único ativo
          </li>
          <li>
            • <strong>Disciplina:</strong> Respeite sempre os limites estabelecidos
          </li>
        </ul>
      </div>
    </div>
  )
}
