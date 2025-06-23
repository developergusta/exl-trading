"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import {
  BarChart3,
  BookOpen,
  Calculator,
  Calendar,
  Globe,
  Settings,
  Target,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface TradingHubProps {
  onAdminClick?: () => void;
}

const tools = [
  {
    id: "trading-diary",
    title: "Diário de Trading",
    description: "Registre e acompanhe suas operações diárias",
    icon: Calendar,
    color: "bg-[#BBF717]",
    path: "/dashboard/trading-diary",
  },
  {
    id: "risk-management",
    title: "Gestão de Risco",
    description: "Calcule e gerencie seus riscos por operação",
    icon: Calculator,
    color: "bg-[#FF6B6B]",
    path: "/dashboard/risk-management",
  },
  {
    id: "consistency-target",
    title: "Alvo de Consistência",
    description: "Mantenha a disciplina com a regra dos 35%",
    icon: Target,
    color: "bg-[#4ECDC4]",
    path: "/dashboard/consistency-target",
  },
  {
    id: "monte-carlo",
    title: "Simulador Monte Carlo",
    description: "Simule cenários futuros baseados em estatísticas",
    icon: BarChart3,
    color: "bg-[#45B7D1]",
    path: "/dashboard/monte-carlo",
  },
  {
    id: "expectancy",
    title: "Painel de Expectativa",
    description: "Analise a expectativa matemática das suas estratégias",
    icon: TrendingUp,
    color: "bg-[#96CEB4]",
    path: "/dashboard/expectancy",
  },
  {
    id: "economic-calendar",
    title: "Calendário Econômico",
    description: "Acompanhe eventos econômicos importantes",
    icon: Globe,
    color: "bg-[#FFEAA7]",
    path: "/dashboard/economic-calendar",
  },
  {
    id: "academy",
    title: "EXL Academy",
    description: "Cursos e treinamentos exclusivos de trading",
    icon: BookOpen,
    color: "bg-[#9B59B6]",
    path: "/dashboard/academy",
  },
  {
    id: "overview",
    title: "Visão Geral",
    description: "Dashboard com resumo de suas operações",
    icon: BarChart3,
    color: "bg-[#FD79A8]",
    path: "/dashboard/overview",
  },
  {
    id: "calendar",
    title: "Calendário",
    description: "Visualize suas operações por data",
    icon: Calendar,
    color: "bg-[#00B894]",
    path: "/dashboard/calendar",
  },
];

export function TradingHub({ onAdminClick }: TradingHubProps) {
  const { user, isAdmin } = useAuth();
  const router = useRouter();

  const handleToolClick = (path: string) => {
    router.push(path);
  };

  return (
    <div className="min-h-screen bg-[#0E0E0E] text-white p-5 pb-20">
      <div className="max-w-6xl mx-auto">
        {/* Header com Logo e User Info */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <img
              src="/images/exl-logo.png"
              alt="EXL Trading Logo"
              className="h-12 w-auto object-contain"
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">
              Bem-vindo, {user?.name}
            </span>
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
              "No que diz respeito ao empenho, ao compromisso, ao esforço, à
              dedicação, não existe meio termo. Ou você faz uma coisa bem feita
              ou não faz."
            </blockquote>
            <cite className="block mt-4 text-[#BBF717] font-bold text-right">
              — Ayrton Senna
            </cite>
          </div>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-4">EXL Trading Hub</h1>
          <p className="text-xl text-gray-400">
            Conjunto completo de ferramentas para traders profissionais
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => {
            const IconComponent = tool.icon;
            return (
              <Card
                key={tool.id}
                className="bg-[#1C1C1C] border-[#2C2C2C] hover:border-[#BBF717] transition-all duration-300 cursor-pointer group"
                onClick={() => handleToolClick(tool.path)}
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
                  <CardDescription className="text-gray-400">
                    {tool.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-[#BBF717] text-black hover:bg-[#9FD615] font-bold">
                    Abrir Ferramenta
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <div className="bg-[#1C1C1C] p-6 rounded-lg">
            <h2 className="text-2xl font-bold text-[#BBF717] mb-4">
              Sobre o EXL Trading Hub
            </h2>
            <p className="text-gray-300 max-w-3xl mx-auto">
              Uma suíte completa de ferramentas desenvolvidas especificamente
              para traders que buscam profissionalismo e consistência. Cada
              ferramenta foi criada para atender uma necessidade específica do
              trading moderno, desde o controle básico de operações até análises
              estatísticas avançadas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
