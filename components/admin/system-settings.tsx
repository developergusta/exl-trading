"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Settings, Database, Download, Upload, Trash2, RefreshCw, Shield, Users, MessageSquare } from "lucide-react"

export function SystemSettings() {
  const [settings, setSettings] = useState({
    autoApproveUsers: false,
    allowUserRegistration: true,
    enablePushNotifications: true,
    maintenanceMode: false,
    maxUsersPerDay: 10,
    sessionTimeout: 24,
  })

  const handleSettingChange = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    localStorage.setItem("systemSettings", JSON.stringify(newSettings))
  }

  const exportAllData = () => {
    const data = {
      users: JSON.parse(localStorage.getItem("users") || "[]"),
      passwords: JSON.parse(localStorage.getItem("passwords") || "{}"),
      trades: JSON.parse(localStorage.getItem("trades") || "[]"),
      communityPosts: JSON.parse(localStorage.getItem("communityPosts") || "[]"),
      companyPosts: JSON.parse(localStorage.getItem("companyPosts") || "[]"),
      notifications: JSON.parse(localStorage.getItem("notifications") || "[]"),
      settings: JSON.parse(localStorage.getItem("systemSettings") || "{}"),
    }

    const dataStr = JSON.stringify(data, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `exl-trading-backup-${new Date().toISOString().split("T")[0]}.json`
    link.click()
  }

  const importAllData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)

        if (data.users) localStorage.setItem("users", JSON.stringify(data.users))
        if (data.passwords) localStorage.setItem("passwords", JSON.stringify(data.passwords))
        if (data.trades) localStorage.setItem("trades", JSON.stringify(data.trades))
        if (data.communityPosts) localStorage.setItem("communityPosts", JSON.stringify(data.communityPosts))
        if (data.companyPosts) localStorage.setItem("companyPosts", JSON.stringify(data.companyPosts))
        if (data.notifications) localStorage.setItem("notifications", JSON.stringify(data.notifications))
        if (data.settings) localStorage.setItem("systemSettings", JSON.stringify(data.settings))

        alert("Dados importados com sucesso! A página será recarregada.")
        window.location.reload()
      } catch (error) {
        alert("Erro ao importar dados. Verifique o formato do arquivo.")
      }
    }
    reader.readAsText(file)
  }

  const clearAllData = () => {
    if (
      !confirm(
        "⚠️ ATENÇÃO: Esta ação irá apagar TODOS os dados do sistema. Esta ação não pode ser desfeita. Tem certeza?",
      )
    )
      return
    if (!confirm("Última confirmação: Todos os usuários, posts, trades e configurações serão perdidos. Continuar?"))
      return

    // Clear all data except admin
    const adminUser = JSON.parse(localStorage.getItem("users") || "[]").find((u: any) => u.role === "admin")
    const adminPassword = JSON.parse(localStorage.getItem("passwords") || "{}")["admin@exltrading.com"]

    localStorage.clear()

    // Restore admin
    if (adminUser && adminPassword) {
      localStorage.setItem("users", JSON.stringify([adminUser]))
      localStorage.setItem("passwords", JSON.stringify({ "admin@exltrading.com": adminPassword }))
    }

    alert("Todos os dados foram apagados. A página será recarregada.")
    window.location.reload()
  }

  const getStorageUsage = () => {
    let total = 0
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length
      }
    }
    return (total / 1024).toFixed(2) // KB
  }

  return (
    <div className="space-y-6">
      {/* System Configuration */}
      <Card className="bg-[#1C1C1C] border-[#2C2C2C]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Settings className="w-5 h-5" />
            Configurações do Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-white">Aprovação Automática</h4>
              <p className="text-sm text-gray-400">Aprovar novos usuários automaticamente</p>
            </div>
            <Switch
              checked={settings.autoApproveUsers}
              onCheckedChange={(checked) => handleSettingChange("autoApproveUsers", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-white">Permitir Cadastros</h4>
              <p className="text-sm text-gray-400">Permitir que novos usuários se cadastrem</p>
            </div>
            <Switch
              checked={settings.allowUserRegistration}
              onCheckedChange={(checked) => handleSettingChange("allowUserRegistration", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-white">Notificações Push</h4>
              <p className="text-sm text-gray-400">Habilitar notificações push do sistema</p>
            </div>
            <Switch
              checked={settings.enablePushNotifications}
              onCheckedChange={(checked) => handleSettingChange("enablePushNotifications", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-white">Modo Manutenção</h4>
              <p className="text-sm text-gray-400">Bloquear acesso de usuários (apenas admin)</p>
            </div>
            <Switch
              checked={settings.maintenanceMode}
              onCheckedChange={(checked) => handleSettingChange("maintenanceMode", checked)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Máximo de usuários por dia</label>
              <Input
                type="number"
                value={settings.maxUsersPerDay}
                onChange={(e) => handleSettingChange("maxUsersPerDay", Number.parseInt(e.target.value))}
                className="bg-[#2A2B2A] border-[#555] text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Timeout da sessão (horas)</label>
              <Input
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => handleSettingChange("sessionTimeout", Number.parseInt(e.target.value))}
                className="bg-[#2A2B2A] border-[#555] text-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="bg-[#1C1C1C] border-[#2C2C2C]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Database className="w-5 h-5" />
            Gerenciamento de Dados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-[#2A2B2A] rounded-lg">
              <Database className="w-8 h-8 text-[#BBF717] mx-auto mb-2" />
              <p className="text-lg font-bold text-white">{getStorageUsage()} KB</p>
              <p className="text-sm text-gray-400">Uso do Storage</p>
            </div>
            <div className="text-center p-4 bg-[#2A2B2A] rounded-lg">
              <Users className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <p className="text-lg font-bold text-white">{JSON.parse(localStorage.getItem("users") || "[]").length}</p>
              <p className="text-sm text-gray-400">Total de Usuários</p>
            </div>
            <div className="text-center p-4 bg-[#2A2B2A] rounded-lg">
              <MessageSquare className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-lg font-bold text-white">
                {JSON.parse(localStorage.getItem("communityPosts") || "[]").length +
                  JSON.parse(localStorage.getItem("companyPosts") || "[]").length}
              </p>
              <p className="text-sm text-gray-400">Total de Posts</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={exportAllData} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Download className="w-4 h-4 mr-2" />
              Exportar Backup
            </Button>

            <input type="file" accept=".json" onChange={importAllData} className="hidden" id="import-data" />
            <Button
              onClick={() => document.getElementById("import-data")?.click()}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Upload className="w-4 h-4 mr-2" />
              Importar Backup
            </Button>

            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="border-[#555] text-white hover:bg-[#2C2C2C]"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Recarregar Sistema
            </Button>

            <Button
              onClick={clearAllData}
              variant="outline"
              className="border-red-500 text-red-400 hover:bg-red-500 hover:text-white"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Limpar Todos os Dados
            </Button>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500 rounded-lg p-4">
            <h4 className="font-medium text-yellow-400 mb-2">⚠️ Importante</h4>
            <ul className="text-sm text-yellow-300 space-y-1">
              <li>• Sempre faça backup antes de importar dados</li>
              <li>• A limpeza de dados é irreversível</li>
              <li>• O modo manutenção bloqueia todos os usuários exceto admin</li>
              <li>• Configurações são salvas automaticamente</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="bg-[#1C1C1C] border-[#2C2C2C]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Shield className="w-5 h-5" />
            Configurações de Segurança
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-[#2A2B2A] p-4 rounded-lg">
            <h4 className="font-medium text-white mb-2">Informações do Admin</h4>
            <div className="space-y-2 text-sm">
              <p className="text-gray-300">Email: admin@exltrading.com</p>
              <p className="text-gray-300">Último acesso: {new Date().toLocaleString("pt-BR")}</p>
              <p className="text-gray-300">Permissões: Administrador Total</p>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-4">
            <h4 className="font-medium text-blue-400 mb-2">🔒 Dicas de Segurança</h4>
            <ul className="text-sm text-blue-300 space-y-1">
              <li>• Altere a senha padrão do admin regularmente</li>
              <li>• Monitore atividades suspeitas na comunidade</li>
              <li>• Faça backups regulares dos dados</li>
              <li>• Revise aprovações de usuários periodicamente</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
