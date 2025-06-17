"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/hooks/use-auth"
import { Settings, LogOut, User, Mail, Phone, Calendar, TrendingUp } from "lucide-react"

export function UserProfile() {
  const { user, logout } = useAuth()

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getExperienceLabel = (experience: string) => {
    const labels: Record<string, string> = {
      iniciante: "Iniciante (0-1 ano)",
      intermediario: "Intermediário (1-3 anos)",
      avancado: "Avançado (3-5 anos)",
      profissional: "Profissional (5+ anos)",
    }
    return labels[experience] || experience
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Profile Header */}
      <Card className="bg-[#1C1C1C] border-[#2C2C2C]">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={`/avatars/${user?.id}.png`} />
              <AvatarFallback className="bg-[#BBF717] text-black text-xl font-bold">
                {getInitials(user?.name || "")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white">{user?.name}</h2>
              <p className="text-gray-400">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600 font-medium">Conta Aprovada</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Info */}
      <Card className="bg-[#1C1C1C] border-[#2C2C2C]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <User className="w-5 h-5" />
            Informações Pessoais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-sm text-gray-400">Email</p>
              <p className="font-medium text-white">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-sm text-gray-400">Telefone</p>
              <p className="font-medium text-white">{user?.phone}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <TrendingUp className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-sm text-gray-400">Experiência</p>
              <p className="font-medium text-white">{getExperienceLabel(user?.experience || "")}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-sm text-gray-400">Membro desde</p>
              <p className="font-medium text-white">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("pt-BR") : "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trading Stats */}
      <Card className="bg-[#1C1C1C] border-[#2C2C2C]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <TrendingUp className="w-5 h-5" />
            Estatísticas de Trading
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-[#2C2C2C] rounded-lg">
              <p className="text-2xl font-bold text-white">0</p>
              <p className="text-sm text-gray-400">Posts na Comunidade</p>
            </div>
            <div className="text-center p-3 bg-[#2C2C2C] rounded-lg">
              <p className="text-2xl font-bold text-white">0</p>
              <p className="text-sm text-gray-400">Curtidas Recebidas</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card className="bg-[#1C1C1C] border-[#2C2C2C]">
        <CardContent className="p-4 space-y-2">
          <Button variant="ghost" className="w-full justify-start text-gray-200 hover:bg-[#2C2C2C]">
            <Settings className="w-4 h-4 mr-3" />
            Configurações
          </Button>
          <Button
            onClick={logout}
            variant="ghost"
            className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Sair da Conta
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
