"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { Bell, BellOff, Shield, Smartphone, X, Zap } from "lucide-react";
import { useState } from "react";

interface NotificationWelcomePromptProps {
  userId?: string;
  onPermissionGranted: () => void;
  onSkip: () => void;
}

export function NotificationWelcomePrompt({
  userId,
  onPermissionGranted,
  onSkip,
}: NotificationWelcomePromptProps) {
  const pushNotifications = usePushNotifications(userId);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleEnableNotifications = async () => {
    setIsProcessing(true);
    try {
      const granted = await pushNotifications.requestPermission();
      if (granted && !pushNotifications.isSubscribed) {
        await pushNotifications.subscribe();

        // Envia uma notificação de boas-vindas
        setTimeout(async () => {
          try {
            await pushNotifications.sendTestNotification({
              title: "🎉 EXL Trading Hub",
              body: "Notificações ativadas com sucesso! Agora você receberá alertas importantes em tempo real.",
              icon: "/icons/icon-192x192.png",
              badge: "/icons/icon-72x72.png",
              tag: "welcome-notification",
              data: {
                url: "/dashboard",
                type: "welcome",
              },
              requireInteraction: false,
            });
          } catch (error) {
            console.error("Erro ao enviar notificação de boas-vindas:", error);
          }
        }, 1000);
      }
      onPermissionGranted();
    } catch (error) {
      console.error("Erro ao habilitar notificações:", error);
      // Mesmo com erro, continua o fluxo
      onPermissionGranted();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0E0E0E] text-white flex items-center justify-center p-4">
      <Card className="w-full max-w-lg bg-[#1C1C1C] border-[#2C2C2C] relative shadow-2xl">
        <Button
          variant="ghost"
          size="sm"
          onClick={onSkip}
          className="absolute top-3 right-3 text-gray-400 hover:text-white z-10"
          disabled={isProcessing}
        >
          <X className="w-4 h-4" />
        </Button>

        <CardHeader className="text-center pb-6 pt-8">
          <div className="mx-auto mb-6 w-20 h-20 bg-gradient-to-br from-[#BBF717] to-[#9FD615] rounded-full flex items-center justify-center shadow-lg">
            <Bell className="w-10 h-10 text-black" />
          </div>
          <CardTitle className="text-2xl text-white mb-2">
            Ativar Notificações Push
          </CardTitle>
          <p className="text-gray-300 text-base">
            Mantenha-se sempre atualizado com o mercado
          </p>
        </CardHeader>

        <CardContent className="space-y-8 pb-8">
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-3 bg-[#2A2B2A] rounded-lg">
              <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Zap className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <h3 className="font-medium text-white mb-1">
                  Alertas em tempo real
                </h3>
                <p className="text-sm text-gray-400">
                  Receba notificações instantâneas sobre movimentos importantes
                  do mercado
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-3 bg-[#2A2B2A] rounded-lg">
              <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Smartphone className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <h3 className="font-medium text-white mb-1">
                  Funciona offline
                </h3>
                <p className="text-sm text-gray-400">
                  Receba alertas mesmo com o aplicativo fechado ou fora de linha
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-3 bg-[#2A2B2A] rounded-lg">
              <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Shield className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <h3 className="font-medium text-white mb-1">
                  Seguro e privado
                </h3>
                <p className="text-sm text-gray-400">
                  Suas informações ficam seguras e você pode desativar a
                  qualquer momento
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleEnableNotifications}
              disabled={isProcessing || pushNotifications.isLoading}
              className="w-full bg-gradient-to-r from-[#BBF717] to-[#9FD615] text-black hover:from-[#9FD615] hover:to-[#8BC34A] font-semibold h-12 text-base shadow-lg"
            >
              <Bell className="w-5 h-5 mr-2" />
              {isProcessing || pushNotifications.isLoading
                ? "Ativando notificações..."
                : "Ativar Notificações Push"}
            </Button>

            <Button
              onClick={onSkip}
              variant="outline"
              disabled={isProcessing}
              className="w-full border-[#555] text-gray-400 hover:border-[#777] hover:text-white h-11"
            >
              <BellOff className="w-4 h-4 mr-2" />
              Pular por enquanto
            </Button>
          </div>

          <div className="bg-[#2A2B2A] border border-[#3A3B3A] rounded-lg p-4">
            <p className="text-xs text-gray-400 text-center">
              💡 <strong>Dica:</strong> Você pode alterar essas configurações a
              qualquer momento no seu perfil. As notificações ajudam você a não
              perder oportunidades importantes no mercado.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
