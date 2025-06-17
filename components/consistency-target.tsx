"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"

export function ConsistencyTarget() {
  const [lucroAtual, setLucroAtual] = useState("3900")
  const [maiorDia, setMaiorDia] = useState("1500")
  const [results, setResults] = useState({
    ideal: 0,
    novaMeta: 0,
    representacao: 0,
    isError: false,
  })

  const formatReal = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  const formatPercent = (value: number) => {
    return (
      value.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) + "%"
    )
  }

  const calculate = () => {
    const lucro = Number.parseFloat(lucroAtual) || 0
    const maiorDiaValue = Number.parseFloat(maiorDia) || 0
    const ideal = lucro * 0.35
    const representacao = lucro ? (maiorDiaValue / lucro) * 100 : 0
    const isError = representacao > 35
    const novaMeta = isError ? maiorDiaValue / 0.35 : lucro

    setResults({
      ideal,
      novaMeta,
      representacao,
      isError,
    })
  }

  useEffect(() => {
    calculate()
  }, [lucroAtual, maiorDia])

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Alvo de Consistência</h1>
        <p className="text-gray-400">Mantenha a disciplina com a regra dos 35%</p>
      </div>

      <div className="bg-[#2A2B2A] p-5 rounded-lg">
        {/* Lucro Atual */}
        <div className="flex justify-between items-center mb-3">
          <label className="flex-1 font-bold">Lucro Atual ou Meta (R$)</label>
          <Input
            type="number"
            value={lucroAtual}
            onChange={(e) => setLucroAtual(e.target.value)}
            step="0.01"
            className="flex-1 ml-4 p-1.5 bg-[#BBF717] text-black rounded border-none text-right"
          />
        </div>

        {/* Lucro Diário Ideal */}
        <div className="flex justify-between items-center mb-3">
          <label className="flex-1 font-bold">Lucro Diário Ideal (35%)</label>
          <div className="flex-1 ml-4 p-1.5 bg-black border border-[#555] text-[#BBF717] rounded text-right">
            {formatReal(results.ideal)}
          </div>
        </div>

        {/* Maior Dia */}
        <div className="flex justify-between items-center mb-3">
          <label className="flex-1 font-bold">Insira Seu Maior Dia (R$)</label>
          <Input
            type="number"
            value={maiorDia}
            onChange={(e) => setMaiorDia(e.target.value)}
            step="0.01"
            className="flex-1 ml-4 p-1.5 bg-[#BBF717] text-black rounded border-none text-right"
          />
        </div>

        {/* Nova Meta */}
        <div className={`flex justify-between items-center mb-3 ${results.isError ? "text-[#FF4C4C]" : ""}`}>
          <label className="flex-1 font-bold">Nova Meta (se necessário)</label>
          <div
            className={`flex-1 ml-4 p-1.5 rounded text-right border ${
              results.isError ? "bg-[#500] text-[#FF4C4C] border-[#FF4C4C]" : "bg-black text-[#BBF717] border-[#555]"
            }`}
          >
            {formatReal(results.novaMeta)}
          </div>
        </div>

        {/* Representação Atual */}
        <div className={`flex justify-between items-center mb-3 ${results.isError ? "text-[#FF4C4C]" : ""}`}>
          <label className="flex-1 font-bold">Representação Atual (%)</label>
          <div
            className={`flex-1 ml-4 p-1.5 rounded text-right border ${
              results.isError ? "bg-[#500] text-[#FF4C4C] border-[#FF4C4C]" : "bg-black text-[#BBF717] border-[#555]"
            }`}
          >
            {formatPercent(results.representacao)}
          </div>
        </div>

        {/* Footer com dicas */}
        <div className="text-sm mt-4 space-y-1">
          <p>
            <strong>Mantenha o valor do seu Maior Dia de Lucro menor que 35% do Lucro Atual ou Meta de Lucro.</strong>
          </p>
          <p>
            Se o seu Maior Dia ultrapassar 35%, a Nova Meta de Lucro será ajustada para que o Lucro Diário Ideal
            corresponda a 35% da Nova Meta.
          </p>
        </div>
      </div>
    </div>
  )
}
