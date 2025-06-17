"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Bell, Send, Users, User, Globe, History } from "lucide-react"

export function NotificationCenter() {
  const [notificationType, setNotificationType] = useState("general")
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [isSending, setIsSending] = useState(false)
  const [sentNotifications, setSentNotifications] = useState<any[]>([])

  const users = JSON.parse(localStorage.getItem("users") || "[]").filter(
    (u: any) => u.role !== "admin" && u.status === "approved",
  )

  const handleSendNotification = async () => {
    if (!title.trim() || !message.trim()) return

    setIsSending(true)

    const notification = {
      id: `notif-${Date.now()}`,
      type: notificationType,
      title,
      message,
      recipients:
        notificationType === "individual" ? selectedUsers : notificationType === "group" ? selectedUsers : ["all"],
      sentAt: new Date().toISOString(),
      status: "sent",
    }

    // Save notification history
    const notifications = JSON.parse(localStorage.getItem("notifications") || "[]")
    notifications.unshift(notification)
    localStorage.setItem("notifications", JSON.stringify(notifications))
    setSentNotifications(notifications)

    // Simulate push notification
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, {
        body: message,
        icon: "/icons/icon-192x192.png",
        badge: "/icons/icon-72x72.png",
      })
    }

    // Reset form
    setTitle("")
    setMessage("")
    setSelectedUsers([])
    setIsSending(false)

    alert("Notificação enviada com sucesso!")
  }

  const handleUserSelection = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId])
    } else {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId))
    }
  }

  const getNotificationTypeIcon = (type: string) => {
    switch (type) {
      case "general":
        return <Globe className="w-4 h-4" />
      case "individual":
        return <User className="w-4 h-4" />
      case "group":
        return <Users className="w-4 h-4" />
      default:
        return <Bell className="w-4 h-4" />
    }
  }

  const getRecipientCount = (notification: any) => {
    if (notification.type === "general") return "Todos os usuários"
    if (notification.recipients.includes("all")) return "Todos os usuários"
    return `${notification.recipients.length} usuário(s)`
  }

  return (
    <div className="space-y-6">
      {/* Send Notification */}
      <Card className="bg-[#1C1C1C] border-[#2C2C2C]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Bell className="w-5 h-5" />
            Enviar Notificação Push
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Notification Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Tipo de Notificação</label>
            <Select value={notificationType} onValueChange={setNotificationType}>
              <SelectTrigger className="bg-[#2A2B2A] border-[#555] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Geral (Todos os usuários)
                  </div>
                </SelectItem>
                <SelectItem value="individual">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Individual (Usuários específicos)
                  </div>
                </SelectItem>
                <SelectItem value="group">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Grupo (Múltiplos usuários)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* User Selection */}
          {(notificationType === "individual" || notificationType === "group") && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Selecionar Usuários ({selectedUsers.length} selecionados)
              </label>
              <div className="bg-[#2A2B2A] border border-[#555] rounded-lg p-4 max-h-48 overflow-y-auto">
                {users.map((user: any) => (
                  <div key={user.id} className="flex items-center space-x-2 py-2">
                    <Checkbox
                      id={user.id}
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={(checked) => handleUserSelection(user.id, checked as boolean)}
                    />
                    <label htmlFor={user.id} className="text-white text-sm cursor-pointer flex-1">
                      {user.name} ({user.email})
                    </label>
                  </div>
                ))}
                {users.length === 0 && (
                  <p className="text-gray-400 text-center py-4">Nenhum usuário aprovado encontrado</p>
                )}
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Título</label>
            <Input
              placeholder="Título da notificação"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-[#2A2B2A] border-[#555] text-white"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Mensagem</label>
            <Textarea
              placeholder="Conteúdo da notificação..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="bg-[#2A2B2A] border-[#555] text-white min-h-[100px]"
              rows={4}
            />
          </div>

          {/* Send Button */}
          <Button
            onClick={handleSendNotification}
            disabled={
              !title.trim() ||
              !message.trim() ||
              isSending ||
              ((notificationType === "individual" || notificationType === "group") && selectedUsers.length === 0)
            }
            className="w-full bg-[#BBF717] text-black hover:bg-[#9FD615]"
          >
            <Send className="w-4 h-4 mr-2" />
            {isSending ? "Enviando..." : "Enviar Notificação"}
          </Button>

          {/* Permission Request */}
          <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-3">
            <p className="text-blue-400 text-sm">
              💡 <strong>Dica:</strong> Para que as notificações funcionem, os usuários precisam permitir notificações
              no navegador.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Notification History */}
      <Card className="bg-[#1C1C1C] border-[#2C2C2C]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <History className="w-5 h-5" />
            Histórico de Notificações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {JSON.parse(localStorage.getItem("notifications") || "[]")
              .slice(0, 10)
              .map((notification: any) => (
                <div key={notification.id} className="bg-[#2A2B2A] p-4 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getNotificationTypeIcon(notification.type)}
                      <h4 className="font-semibold text-white">{notification.title}</h4>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(notification.sentAt).toLocaleString("pt-BR")}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm mb-2">{notification.message}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Enviado para: {getRecipientCount(notification)}</span>
                    <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded">{notification.status}</span>
                  </div>
                </div>
              ))}
            {JSON.parse(localStorage.getItem("notifications") || "[]").length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma notificação enviada ainda</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
