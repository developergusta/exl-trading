"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTrades } from "@/hooks/use-trades"

export function TradeForm() {
  const [date, setDate] = useState("")
  const [pl, setPl] = useState("")
  const [tradeType, setTradeType] = useState("buy")
  const [asset, setAsset] = useState("")
  const [contracts, setContracts] = useState("")
  const [strategy, setStrategy] = useState("")
  const [tradePl, setTradePl] = useState("")

  const { addTrade } = useTrades()

  const handleSubmit = () => {
    if (!date || pl === "") {
      alert("Insira a data e o P&L.")
      return
    }

    addTrade({
      date,
      pl,
      details: {
        type: tradeType,
        asset,
        contracts,
        strategy,
        tradePl,
      },
    })

    // Reset form
    setDate("")
    setPl("")
    setTradeType("buy")
    setAsset("")
    setContracts("")
    setStrategy("")
    setTradePl("")

    alert("Salvo com sucesso!")
  }

  return (
    <div className="max-w-2xl mx-auto bg-[#1C1C1C] p-5 rounded-lg">
      <h2 className="text-2xl font-bold text-[#BBF717] mb-5">Inserir Operação</h2>

      <div className="space-y-4">
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-2 text-black" />

        <Input
          type="number"
          placeholder="Resultado líquido do dia (ex: 350 ou -120)"
          value={pl}
          onChange={(e) => setPl(e.target.value)}
          className="w-full p-2 text-black"
        />

        <h3 className="text-lg font-bold text-[#BBF717] mt-6 mb-3">Detalhar Trade (opcional)</h3>

        <Select value={tradeType} onValueChange={setTradeType}>
          <SelectTrigger className="w-full text-black">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="buy">Tipo: Compra</SelectItem>
            <SelectItem value="sell">Tipo: Venda</SelectItem>
          </SelectContent>
        </Select>

        <Input
          type="text"
          placeholder="Ativo"
          value={asset}
          onChange={(e) => setAsset(e.target.value)}
          className="w-full p-2 text-black"
        />

        <Input
          type="number"
          placeholder="Contratos/Lotes"
          value={contracts}
          onChange={(e) => setContracts(e.target.value)}
          className="w-full p-2 text-black"
        />

        <Input
          type="text"
          placeholder="Estratégia"
          value={strategy}
          onChange={(e) => setStrategy(e.target.value)}
          className="w-full p-2 text-black"
        />

        <Input
          type="number"
          placeholder="P&L da operação"
          value={tradePl}
          onChange={(e) => setTradePl(e.target.value)}
          className="w-full p-2 text-black"
        />

        <Button
          onClick={handleSubmit}
          className="w-full bg-[#BBF717] text-[#0E0E0E] hover:bg-[#9FD615] font-bold text-lg py-3 mt-4"
        >
          Salvar
        </Button>
      </div>
    </div>
  )
}
