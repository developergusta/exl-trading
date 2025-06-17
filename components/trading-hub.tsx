"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TradingDiary } from "@/components/trading-diary"
import { RiskManagement } from "@/components/risk-management"
import { ConsistencyTarget } from "@/components/consistency-target"
import { MonteCarloSimulator } from "@/components/monte-carlo-simulator"
import { ExpectancyPanel } from "@/components/expectancy-panel"
import { EconomicCalendar } from "@/components/economic-calendar"
import {
  Calendar,
  Calculator,
  Target,
  BarChart3,
  TrendingUp,
  Globe,
  ArrowLeft,
  LogOut,
  Settings,
  BookOpen,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { ExlAcademy } from "@/components/academy/exl-academy"

type Tool = "home" | "diary" | "risk" | "consistency" | "montecarlo" | "expectancy" | "economic" | "academy"

interface TradingHubProps {
  onAdminClick?: () => void
}

const tools = [
  {
    id: "diary" as Tool,
    title: "Diário de Trading",
    description: "Registre e acompanhe suas operações diárias",
    icon: Calendar,
    color: "bg-[#BBF717]",
  },
  {
    id: "risk" as Tool,
    title: "Gestão de Risco",
    description: "Calcule e gerencie seus riscos por operação",
    icon: Calculator,
    color: "bg-[#FF6B6B]",
  },
  {
    id: "consistency" as Tool,
    title: "Alvo de Consistência",
    description: "Mantenha a disciplina com a regra dos 35%",
    icon: Target,
    color: "bg-[#4ECDC4]",
  },
  {
    id: "montecarlo" as Tool,
    title: "Simulador Monte Carlo",
    description: "Simule cenários futuros baseados em estatísticas",
    icon: BarChart3,
    color: "bg-[#45B7D1]",
  },
  {
    id: "expectancy" as Tool,
    title: "Painel de Expectativa",
    description: "Analise a expectativa matemática das suas estratégias",
    icon: TrendingUp,
    color: "bg-[#96CEB4]",
  },
  {
    id: "economic" as Tool,
    title: "Calendário Econômico",
    description: "Acompanhe eventos econômicos importantes",
    icon: Globe,
    color: "bg-[#FFEAA7]",
  },
  {
    id: "academy" as Tool,
    title: "EXL Academy",
    description: "Cursos e treinamentos exclusivos de trading",
    icon: BookOpen,
    color: "bg-[#9B59B6]",
  },
]

export function TradingHub({ onAdminClick }: TradingHubProps) {
  const [activeTool, setActiveTool] = useState<Tool>("home")
  const { user, logout, isAdmin } = useAuth()

  const renderTool = () => {
    switch (activeTool) {
      case "diary":
        return <TradingDiary />
      case "risk":
        return <RiskManagement />
      case "consistency":
        return <ConsistencyTarget />
      case "montecarlo":
        return <MonteCarloSimulator />
      case "expectancy":
        return <ExpectancyPanel />
      case "economic":
        return <EconomicCalendar />
      case "academy":
        return <ExlAcademy />
      default:
        return null
    }
  }

  if (activeTool !== "home") {
    return (
      <div className="min-h-screen bg-[#0E0E0E] text-white">
        <div className="p-5">
          <div className="flex justify-between items-center mb-5">
            <Button onClick={() => setActiveTool("home")} className="bg-[#1C1C1C] text-[#BBF717] hover:bg-[#2C2C2C]">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Hub
            </Button>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-400">Olá, {user?.name}</span>
              <Button
                onClick={logout}
                variant="outline"
                size="sm"
                className="text-red-400 border-red-400 hover:bg-red-400 hover:text-black"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {renderTool()}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0E0E0E] text-white p-5 pb-20">
      <div className="max-w-6xl mx-auto">
        {/* Header com Logo e User Info */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <img src="/images/exl-logo.png" alt="EXL Trading Logo" className="h-12 w-auto object-contain" />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">Bem-vindo, {user?.name}</span>
            {isAdmin && (
              <Button
                onClick={onAdminClick}
                size="sm"
                className="bg-[#BBF717] text-black hover:bg-[#9FD615] border-none font-medium"
              >
                <Settings className="h-4 w-4 mr-2" />
                Admin
              </Button>
            )}
          </div>
        </div>

        {/* Frase Inspiracional */}
        <div className="text-center mb-12">
          <div className="bg-[#1C1C1C] p-6 rounded-lg border border-[#BBF717] mb-8 max-w-4xl mx-auto">
            <blockquote className="text-lg md:text-xl text-gray-300 italic leading-relaxed">
              "No que diz respeito ao empenho, ao compromisso, ao esforço, à dedicação, não existe meio termo. Ou você
              faz uma coisa bem feita ou não faz."
            </blockquote>
            <cite className="block mt-4 text-[#BBF717] font-bold text-right">— Ayrton Senna</cite>
          </div>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-4">EXL Trading Hub</h1>
          <p className="text-xl text-gray-400">Conjunto completo de ferramentas para traders profissionais</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => {
            const IconComponent = tool.icon
            return (
              <Card
                key={tool.id}
                className="bg-[#1C1C1C] border-[#2C2C2C] hover:border-[#BBF717] transition-all duration-300 cursor-pointer group"
                onClick={() => setActiveTool(tool.id)}
              >
                <CardHeader className="text-center">
                  <div
                    className={`w-16 h-16 ${tool.color} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <IconComponent className="h-8 w-8 text-black" />
                  </div>
                  <CardTitle className="text-white group-hover:text-[#BBF717] transition-colors">
                    {tool.title}
                  </CardTitle>
                  <CardDescription className="text-gray-400">{tool.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-[#BBF717] text-black hover:bg-[#9FD615] font-bold">
                    Abrir Ferramenta
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="mt-12 text-center">
          <div className="bg-[#1C1C1C] p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-[#BBF717] mb-4">Sobre o EXL Trading Hub</h2>
            <p className="text-gray-300 max-w-3xl mx-auto">
              Uma suíte completa de ferramentas desenvolvidas especificamente para traders que buscam profissionalismo e
              consistência. Cada ferramenta foi criada para atender uma necessidade específica do trading moderno, desde
              o controle básico de operações até análises estatísticas avançadas.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
