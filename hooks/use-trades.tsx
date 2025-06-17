"use client"

import { useState, useEffect } from "react"

export interface Trade {
  date: string
  pl: string
  details?: {
    type: string
    asset: string
    contracts: string
    strategy: string
    tradePl: string
  }
}

export function useTrades() {
  const [trades, setTrades] = useState<Trade[]>([])

  useEffect(() => {
    const savedTrades = localStorage.getItem("trades")
    if (savedTrades) {
      setTrades(JSON.parse(savedTrades))
    }
  }, [])

  const addTrade = (trade: Trade) => {
    const existingIndex = trades.findIndex((t) => t.date === trade.date)
    let newTrades: Trade[]

    if (existingIndex >= 0) {
      newTrades = [...trades]
      newTrades[existingIndex] = trade
    } else {
      newTrades = [...trades, trade]
    }

    setTrades(newTrades)
    localStorage.setItem("trades", JSON.stringify(newTrades))
  }

  const getTotalPL = () => {
    return trades.reduce((total, trade) => total + Number.parseFloat(trade.pl), 0)
  }

  const getTotalTrades = () => {
    return trades.length
  }

  const getProfitDays = () => {
    return trades.filter((trade) => Number.parseFloat(trade.pl) > 0).length
  }

  const getLossDays = () => {
    return trades.filter((trade) => Number.parseFloat(trade.pl) < 0).length
  }

  const getWinRate = () => {
    if (trades.length === 0) return "0.00"
    return ((getProfitDays() / trades.length) * 100).toFixed(2)
  }

  const getBestDay = () => {
    if (trades.length === 0) return "-"
    const best = trades.reduce((max, trade) => (Number.parseFloat(trade.pl) > Number.parseFloat(max.pl) ? trade : max))
    return Number.parseFloat(best.pl).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
  }

  const getWorstDay = () => {
    if (trades.length === 0) return "-"
    const worst = trades.reduce((min, trade) => (Number.parseFloat(trade.pl) < Number.parseFloat(min.pl) ? trade : min))
    return Number.parseFloat(worst.pl).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
  }

  return {
    trades,
    addTrade,
    getTotalPL,
    getTotalTrades,
    getProfitDays,
    getLossDays,
    getWinRate,
    getBestDay,
    getWorstDay,
  }
}
