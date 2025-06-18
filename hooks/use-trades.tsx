"use client";

import { useAuth } from "@/hooks/use-auth";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export interface Trade {
  id?: string;
  date: string;
  pl: string;
  user_id?: string;
}

export function useTrades() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const { user } = useAuth();

  // Buscar trades do Supabase
  useEffect(() => {
    const fetchTrades = async () => {
      if (isSupabaseConfigured && supabase && user) {
        const { data, error } = await supabase
          .from("trades")
          .select("id, date, pl")
          .eq("user_id", user.id)
          .order("date", { ascending: true });
        if (!error && data) {
          setTrades(data.map((t) => ({ ...t, pl: String(t.pl) })));
        }
      }
    };
    fetchTrades();
  }, [user]);

  // Adicionar trade no Supabase
  const addTrade = async (trade: Trade) => {
    if (!isSupabaseConfigured || !supabase || !user) return;

    // Insere novo trade
    const { data, error } = await supabase.from("trades").insert({
      user_id: user.id,
      date: trade.date,
      pl: trade.pl,
    });

    if (!error) {
      // Atualiza lista
      const { data: updatedTrades } = await supabase
        .from("trades")
        .select("id, date, pl")
        .eq("user_id", user.id)
        .order("date", { ascending: true });

      if (updatedTrades) {
        setTrades(updatedTrades.map((t) => ({ ...t, pl: String(t.pl) })));
      }
    }
  };

  const getTotalPL = () => {
    return trades.reduce(
      (total, trade) => total + Number.parseFloat(trade.pl),
      0
    );
  };

  const getTotalTrades = () => {
    return trades.length;
  };

  const getProfitDays = () => {
    // Agrupa trades por dia e soma os PLs
    const dailyPL = trades.reduce((acc, trade) => {
      acc[trade.date] = (acc[trade.date] || 0) + Number.parseFloat(trade.pl);
      return acc;
    }, {} as Record<string, number>);

    // Conta dias com PL positivo
    return Object.values(dailyPL).filter((pl) => pl > 0).length;
  };

  const getLossDays = () => {
    // Agrupa trades por dia e soma os PLs
    const dailyPL = trades.reduce((acc, trade) => {
      acc[trade.date] = (acc[trade.date] || 0) + Number.parseFloat(trade.pl);
      return acc;
    }, {} as Record<string, number>);

    // Conta dias com PL negativo
    return Object.values(dailyPL).filter((pl) => pl < 0).length;
  };

  const getWinRate = () => {
    // Agrupa trades por dia e soma os PLs
    const dailyPL = trades.reduce((acc, trade) => {
      acc[trade.date] = (acc[trade.date] || 0) + Number.parseFloat(trade.pl);
      return acc;
    }, {} as Record<string, number>);

    const totalDays = Object.keys(dailyPL).length;
    if (totalDays === 0) return "0.00";

    const profitDays = Object.values(dailyPL).filter((pl) => pl > 0).length;
    return ((profitDays / totalDays) * 100).toFixed(2);
  };

  const getBestDay = () => {
    // Agrupa trades por dia e soma os PLs
    const dailyPL = trades.reduce((acc, trade) => {
      acc[trade.date] = (acc[trade.date] || 0) + Number.parseFloat(trade.pl);
      return acc;
    }, {} as Record<string, number>);

    if (Object.keys(dailyPL).length === 0) return "-";

    const bestPL = Math.max(...Object.values(dailyPL));
    return bestPL.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const getWorstDay = () => {
    // Agrupa trades por dia e soma os PLs
    const dailyPL = trades.reduce((acc, trade) => {
      acc[trade.date] = (acc[trade.date] || 0) + Number.parseFloat(trade.pl);
      return acc;
    }, {} as Record<string, number>);

    if (Object.keys(dailyPL).length === 0) return "-";

    const worstPL = Math.min(...Object.values(dailyPL));
    return worstPL.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

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
  };
}
