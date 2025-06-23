"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { Bell, BellOff, CheckCircle, Smartphone, XCircle } from "lucide-react";
import { useState } from "react";

export function PushNotificationSetup() {
  const { user } = useAuth();
  const pushNotifications = usePushNotifications(user?.id);
  const [isTestingNotification, setIsTestingNotification] = useState(false);

  const handleEnableNotifications = async () => {
    try {
      if (!pushNotifications.hasPermission) {
        await pushNotifications.requestPermission();
      }

      if (pushNotifications.hasPermission && !pushNotifications.isSubscribed) {
        await pushNotifications.subscribe();
      }
    } catch (error) {
      console.error("Erro ao habilitar notificações:", error);
    }
  };

  const handleDisableNotifications = async () => {
    try {
      await pushNotifications.unsubscribe();
    } catch (error) {
      console.error("Erro ao desabilitar notificações:", error);
    }
  };

  const handleTestNotification = async () => {
    if (!pushNotifications.isSubscribed) return;

    setIsTestingNotification(true);
    try {
      await pushNotifications.sendTestNotification({
        title: "EXL Trading Hub - Teste",
        body: "Esta é uma notificação de teste! Push notifications estão funcionando perfeitamente.",
        icon: "/icons/icon-192x192.png",
        badge: "/icons/icon-72x72.png",
        tag: "test-notification",
        data: {
          url: "/dashboard",
          type: "test",
        },
        requireInteraction: true,
        actions: [
          {
            action: "open",
            title: "Abrir App",
            icon: "/icons/icon-72x72.png",
          },
          {
            action: "close",
            title: "Fechar",
          },
        ],
      });
    } catch (error) {
      console.error("Erro ao enviar notificação de teste:", error);
    } finally {
      setIsTestingNotification(false);
    }
  };

  const getStatusColor = () => {
    if (!pushNotifications.isSupported) return "text-gray-400";
    if (!pushNotifications.hasPermission) return "text-red-400";
    if (!pushNotifications.isSubscribed) return "text-yellow-400";
    return "text-green-400";
  };

  const getStatusIcon = () => {
    if (!pushNotifications.isSupported) return <XCircle className="w-5 h-5" />;
    if (!pushNotifications.hasPermission)
      return <BellOff className="w-5 h-5" />;
    if (!pushNotifications.isSubscribed) return <Bell className="w-5 h-5" />;
    return <CheckCircle className="w-5 h-5" />;
  };

  const getStatusText = () => {
    if (!pushNotifications.isSupported) return "Não suportado neste navegador";
    if (!pushNotifications.hasPermission) return "Permissão necessária";
    if (!pushNotifications.isSubscribed) return "Notificações desabilitadas";
    return "Notificações ativas";
  };

  return (
    <Card className="bg-[#1C1C1C] border-[#2C2C2C]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Smartphone className="w-5 h-5" />
          Notificações Push
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Atual */}
        <div className="flex items-center justify-between p-3 bg-[#2A2B2A] rounded-lg">
          <div className="flex items-center gap-3">
            <div className={getStatusColor()}>{getStatusIcon()}</div>
            <div>
              <h3 className="font-medium text-white">
                Status das Notificações
              </h3>
              <p className={`text-sm ${getStatusColor()}`}>{getStatusText()}</p>
            </div>
          </div>
        </div>

        {/* Informações sobre push notifications */}
        <div className="space-y-2">
          <h4 className="font-medium text-white">
            Como funcionam as notificações push?
          </h4>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Receba alertas mesmo com o app fechado</li>
            <li>• Notificações de trades importantes</li>
            <li>• Lembretes de análises e estratégias</li>
            <li>• Alertas de mercado em tempo real</li>
          </ul>
        </div>

        {/* Controles */}
        <div className="space-y-3">
          {!pushNotifications.isSupported && (
            <div className="bg-yellow-500/10 border border-yellow-500 rounded-lg p-3">
              <p className="text-yellow-400 text-sm">
                ⚠️ Seu navegador não suporta notificações push. Tente usar
                Chrome, Firefox ou Safari mais recentes.
              </p>
            </div>
          )}

          {pushNotifications.isSupported &&
            !pushNotifications.hasPermission && (
              <div className="space-y-3">
                <div className="bg-blue-500/10 border border-blue-500 rounded-lg p-3">
                  <p className="text-blue-400 text-sm">
                    💡 Para receber notificações, é necessário conceder
                    permissão. Clique no botão abaixo para habilitar.
                  </p>
                </div>
                <Button
                  onClick={handleEnableNotifications}
                  disabled={pushNotifications.isLoading}
                  className="w-full bg-[#BBF717] text-black hover:bg-[#9FD615]"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  {pushNotifications.isLoading
                    ? "Habilitando..."
                    : "Habilitar Notificações"}
                </Button>
              </div>
            )}

          {pushNotifications.hasPermission &&
            !pushNotifications.isSubscribed && (
              <div className="space-y-3">
                <div className="bg-green-500/10 border border-green-500 rounded-lg p-3">
                  <p className="text-green-400 text-sm">
                    ✅ Permissão concedida! Agora você pode ativar as
                    notificações push.
                  </p>
                </div>
                <Button
                  onClick={handleEnableNotifications}
                  disabled={pushNotifications.isLoading}
                  className="w-full bg-[#BBF717] text-black hover:bg-[#9FD615]"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  {pushNotifications.isLoading
                    ? "Ativando..."
                    : "Ativar Notificações Push"}
                </Button>
              </div>
            )}

          {pushNotifications.isSubscribed && (
            <div className="space-y-3">
              <div className="bg-green-500/10 border border-green-500 rounded-lg p-3">
                <p className="text-green-400 text-sm">
                  🎉 Notificações push ativas! Você receberá alertas importantes
                  mesmo quando o app estiver fechado.
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleTestNotification}
                  disabled={isTestingNotification}
                  variant="outline"
                  className="flex-1 border-[#555] hover:border-[#BBF717] hover:bg-[#BBF717]/10"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  {isTestingNotification ? "Enviando..." : "Testar"}
                </Button>

                <Button
                  onClick={handleDisableNotifications}
                  disabled={pushNotifications.isLoading}
                  variant="outline"
                  className="flex-1 border-red-500 text-red-400 hover:bg-red-500/10"
                >
                  <BellOff className="w-4 h-4 mr-2" />
                  {pushNotifications.isLoading ? "Desativando..." : "Desativar"}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Error display */}
        {pushNotifications.error && (
          <div className="bg-red-500/10 border border-red-500 rounded-lg p-3">
            <p className="text-red-400 text-sm">⚠️ {pushNotifications.error}</p>
          </div>
        )}

        {/* Instruções técnicas */}
        <details className="text-sm">
          <summary className="text-gray-400 cursor-pointer hover:text-white">
            Informações técnicas
          </summary>
          <div className="mt-2 space-y-2 text-gray-300">
            <p>
              <strong>Suporte:</strong>{" "}
              {pushNotifications.isSupported
                ? "✅ Disponível"
                : "❌ Não disponível"}
            </p>
            <p>
              <strong>Permissão:</strong>{" "}
              {pushNotifications.hasPermission ? "✅ Concedida" : "❌ Negada"}
            </p>
            <p>
              <strong>Subscription:</strong>{" "}
              {pushNotifications.isSubscribed ? "✅ Ativa" : "❌ Inativa"}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Para funcionar corretamente, o app deve estar instalado como PWA e
              as notificações devem estar habilitadas no sistema operacional.
            </p>
          </div>
        </details>
      </CardContent>
    </Card>
  );
}
