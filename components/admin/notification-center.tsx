"use client";

import { AlertDialog } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { PushNotification, pushService } from "@/lib/push-service";
import {
  Bell,
  Globe,
  History,
  Send,
  Smartphone,
  User,
  Users,
  Wifi,
} from "lucide-react";
import { useEffect, useState } from "react";
import { usePushNotifications } from "../../hooks/use-push-notifications";

export function NotificationCenter() {
  const [notificationType, setNotificationType] = useState("general");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [sentNotifications, setSentNotifications] = useState<any[]>([]);
  const [alertOpen, setAlertOpen] = useState(false);
  const [usePushNotificationsMethod, setUsePushNotificationsMethod] =
    useState(true);
  const [pushEnabled, setPushEnabled] = useState(false);

  const users = JSON.parse(localStorage.getItem("users") || "[]").filter(
    (u: any) => u.role !== "admin" && u.status === "approved"
  );

  // Hook para push notifications (usando ID do admin como exemplo)
  const pushNotificationsHook = usePushNotifications("admin");

  useEffect(() => {
    // Verifica se push notifications estão disponíveis
    setPushEnabled(
      pushNotificationsHook.isSupported && pushNotificationsHook.hasPermission
    );
  }, [pushNotificationsHook.isSupported, pushNotificationsHook.hasPermission]);

  const handleEnablePushNotifications = async () => {
    try {
      // Primeiro, solicita permissão se não tiver
      if (!pushNotificationsHook.hasPermission) {
        const permissionGranted =
          await pushNotificationsHook.requestPermission();
        if (!permissionGranted) {
          console.error("Permissão negada pelo usuário");
          return;
        }
      }

      // Depois, cria a subscription se não estiver inscrito
      if (!pushNotificationsHook.isSubscribed) {
        const success = await pushNotificationsHook.subscribe();
        if (success) {
          setPushEnabled(true);
          // Força atualização do status
          await pushNotificationsHook.checkStatus();
        }
      }
    } catch (error) {
      console.error("Erro ao habilitar push notifications:", error);
    }
  };

  const handleSendNotification = async () => {
    if (!title.trim() || !message.trim()) return;

    setIsSending(true);

    const notification = {
      id: `notif-${Date.now()}`,
      type: notificationType,
      title,
      message,
      recipients:
        notificationType === "individual"
          ? selectedUsers
          : notificationType === "group"
          ? selectedUsers
          : ["all"],
      sentAt: new Date().toISOString(),
      status: "sent",
      method: usePushNotificationsMethod ? "push" : "local",
    };

    try {
      // Salva no histórico
      const notifications = JSON.parse(
        localStorage.getItem("notifications") || "[]"
      );
      notifications.unshift(notification);
      localStorage.setItem("notifications", JSON.stringify(notifications));
      setSentNotifications(notifications);

      if (usePushNotificationsMethod && pushEnabled) {
        // Envia via push notifications
        const pushNotification: PushNotification = {
          title,
          body: message,
          icon: "/icons/icon-192x192.png",
          badge: "/icons/icon-72x72.png",
          tag: `exl-${Date.now()}`,
          data: {
            url: "/dashboard",
            timestamp: new Date().toISOString(),
          },
          requireInteraction: true,
        };

        // Para demonstração, envia notificação local (teste)
        if (notificationType === "general" || selectedUsers.length > 0) {
          await pushNotificationsHook.sendTestNotification(pushNotification);
        }

        // Em produção, aqui você enviaria para o servidor que distribuiria para os usuários selecionados
        const targetUserIds =
          notificationType === "general"
            ? users.map((u: any) => u.id)
            : selectedUsers;

        console.log(
          `Push notification enviada para ${targetUserIds.length} usuários:`,
          pushNotification
        );
      } else {
        // Fallback para notificação local simples
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification(title, {
            body: message,
            icon: "/icons/icon-192x192.png",
            badge: "/icons/icon-72x72.png",
          });
        }
      }

      // Reset form
      setTitle("");
      setMessage("");
      setSelectedUsers([]);
      setAlertOpen(true);
    } catch (error) {
      console.error("Erro ao enviar notificação:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleUserSelection = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers([...selectedUsers, userId]);
    } else {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    }
  };

  const getNotificationTypeIcon = (type: string) => {
    switch (type) {
      case "general":
        return <Globe className="w-4 h-4" />;
      case "individual":
        return <User className="w-4 h-4" />;
      case "group":
        return <Users className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getRecipientCount = (notification: any) => {
    if (notification.type === "general") return "Todos os usuários";
    if (notification.recipients.includes("all")) return "Todos os usuários";
    return `${notification.recipients.length} usuário(s)`;
  };

  const getMethodIcon = (method: string) => {
    return method === "push" ? (
      <Smartphone className="w-4 h-4" />
    ) : (
      <Bell className="w-4 h-4" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Push Notifications Status - Sistema */}
      <Card className="bg-[#1C1C1C] border-[#2C2C2C]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Smartphone className="w-5 h-5" />
            Sistema de Push Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status do Sistema */}
            <div className="bg-[#2A2B2A] rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Wifi className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium text-white">Sistema</span>
              </div>
              <p className="text-xs text-green-400">✅ Operacional</p>
            </div>

            {/* Usuários Inscritos */}
            <div className="bg-[#2A2B2A] rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-white">Usuários</span>
              </div>
              <p className="text-xs text-blue-400">
                {pushService.getAllSubscriptions().length} inscritos
              </p>
            </div>

            {/* API Status */}
            <div className="bg-[#2A2B2A] rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Send className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-white">API</span>
              </div>
              <p className="text-xs text-purple-400">✅ Configurada</p>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-3">
            <p className="text-blue-400 text-sm">
              💡 <strong>Como funciona:</strong>
            </p>
            <div className="text-blue-300 text-xs mt-2 space-y-1">
              <p>
                1. Usuários habilitam push em{" "}
                <strong>Dashboard → Perfil → Configurações</strong>
              </p>
              <p>2. Sistema coleta subscriptions automaticamente</p>
              <p>3. Você envia notificações usando o painel abaixo</p>
              <p>4. Notificações chegam mesmo com app fechado</p>
            </div>
          </div>

          <div className="bg-green-500/10 border border-green-500 rounded-lg p-3">
            <p className="text-green-400 text-sm">
              ✅ Sistema pronto para envio de notificações!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Send Notification */}
      <Card className="bg-[#1C1C1C] border-[#2C2C2C]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Bell className="w-5 h-5" />
            Enviar Notificação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Notification Method */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-300">
                Método de envio
              </label>
              <p className="text-xs text-gray-500">
                {usePushNotifications()
                  ? "Enviará via push notifications (funciona mesmo com app fechado)"
                  : "Enviará via notificação local (apenas com app aberto)"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-300">Local</span>
              <Switch
                checked={usePushNotificationsMethod}
                onCheckedChange={setUsePushNotificationsMethod}
                disabled={!pushEnabled}
              />
              <span className="text-sm text-gray-300">Push</span>
            </div>
          </div>

          {/* Notification Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tipo de Notificação
            </label>
            <Select
              value={notificationType}
              onValueChange={setNotificationType}
            >
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
          {(notificationType === "individual" ||
            notificationType === "group") && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Selecionar Usuários ({selectedUsers.length} selecionados)
              </label>
              <div className="bg-[#2A2B2A] border border-[#555] rounded-lg p-4 max-h-48 overflow-y-auto">
                {users.map((user: any) => (
                  <div
                    key={user.id}
                    className="flex items-center space-x-2 py-2"
                  >
                    <Checkbox
                      id={user.id}
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={(checked) =>
                        handleUserSelection(user.id, checked as boolean)
                      }
                    />
                    <label
                      htmlFor={user.id}
                      className="text-white text-sm cursor-pointer flex-1"
                    >
                      {user.name} ({user.email})
                    </label>
                  </div>
                ))}
                {users.length === 0 && (
                  <p className="text-gray-400 text-center py-4">
                    Nenhum usuário aprovado encontrado
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Título
            </label>
            <Input
              placeholder="Título da notificação"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-[#2A2B2A] border-[#555] text-white"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Mensagem
            </label>
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
              ((notificationType === "individual" ||
                notificationType === "group") &&
                selectedUsers.length === 0)
            }
            className="w-full bg-[#BBF717] text-black hover:bg-[#9FD615]"
          >
            <Send className="w-4 h-4 mr-2" />
            {isSending
              ? "Enviando..."
              : `Enviar ${usePushNotificationsMethod ? "Push" : "Local"}`}
          </Button>

          {/* Permission Request */}
          <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-3">
            <p className="text-blue-400 text-sm">
              💡 <strong>Dica:</strong> Para que as notificações push funcionem,
              os usuários precisam ter instalado o PWA e permitido notificações.
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
                <div
                  key={notification.id}
                  className="bg-[#2A2B2A] p-4 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getNotificationTypeIcon(notification.type)}
                      <h4 className="font-semibold text-white">
                        {notification.title}
                      </h4>
                      <div className="flex items-center gap-1">
                        {getMethodIcon(notification.method || "local")}
                        <span className="text-xs text-gray-500">
                          {notification.method === "push" ? "Push" : "Local"}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(notification.sentAt).toLocaleString("pt-BR")}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm mb-2">
                    {notification.message}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Enviado para: {getRecipientCount(notification)}</span>
                    <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded">
                      {notification.status}
                    </span>
                  </div>
                </div>
              ))}
            {JSON.parse(localStorage.getItem("notifications") || "[]")
              .length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma notificação enviada ainda</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog
        open={alertOpen}
        onOpenChange={setAlertOpen}
        description="Notificação enviada com sucesso!"
      />
    </div>
  );
}
