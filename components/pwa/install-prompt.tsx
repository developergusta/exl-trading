"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, Plus, Share, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [debugInfo, setDebugInfo] = useState("");

  useEffect(() => {
    // Detectar plataformas
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const android = /Android/.test(navigator.userAgent);
    setIsIOS(iOS);
    setIsAndroid(android);

    // Verificar se está no modo standalone
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes("android-app://");
    setIsStandalone(standalone);

    // Debug info
    setDebugInfo(
      `iOS: ${iOS}, Android: ${android}, Standalone: ${standalone}, UserAgent: ${navigator.userAgent}`
    );

    // Listen for beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log("beforeinstallprompt event fired", e);
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Check if PWA criteria are met
    const checkPWACriteria = () => {
      const hasManifest = document.querySelector('link[rel="manifest"]');
      const hasServiceWorker = "serviceWorker" in navigator;
      const isSecure =
        location.protocol === "https:" || location.hostname === "localhost";

      console.log("PWA Criteria Check:", {
        hasManifest: !!hasManifest,
        hasServiceWorker,
        isSecure,
        swRegistration: navigator.serviceWorker?.controller,
      });
    };

    // Check criteria after a delay to ensure everything is loaded
    setTimeout(checkPWACriteria, 2000);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstallClick = async () => {
    console.log(
      "Install click - deferredPrompt:",
      !!deferredPrompt,
      "isIOS:",
      isIOS,
      "isAndroid:",
      isAndroid
    );

    // Para iOS Safari - mostrar modal visual
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    // Para Android/Chrome - usar prompt nativo se disponível
    if (deferredPrompt) {
      try {
        console.log("Showing native prompt");
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log("User choice:", outcome);
        setDeferredPrompt(null);
      } catch (error) {
        console.error("Error showing install prompt:", error);
        showFallbackInstructions();
      }
    } else {
      // Se não tem prompt nativo disponível
      console.log("No deferred prompt available, showing fallback");
      showFallbackInstructions();
    }
  };

  const showFallbackInstructions = () => {
    if (isAndroid) {
      alert(
        "Para instalar o app no Android:\n\n" +
          "1. Toque no menu (⋮) do Chrome\n" +
          "2. Toque em 'Adicionar à tela inicial' ou 'Instalar aplicativo'\n" +
          "3. Confirme a instalação\n\n" +
          `Debug: ${debugInfo}`
      );
    } else {
      alert(
        "Para instalar o app:\n\n" +
          "• Chrome: Menu (⋮) > 'Instalar aplicativo'\n" +
          "• Firefox: Menu (☰) > 'Instalar'\n" +
          "• Safari: Compartilhar (⬆️) > 'Adicionar à Tela de Início'\n\n" +
          `Debug: ${debugInfo}`
      );
    }
  };

  return (
    <>
      <Button
        onClick={handleInstallClick}
        className="bg-[#BBF717] text-black hover:bg-[#9FD615] text-sm w-full mt-2"
      >
        <Download className="w-4 h-4 mr-2" />
        Instalar App
      </Button>

      {/* Modal para iOS */}
      <Dialog open={showIOSModal} onOpenChange={setShowIOSModal}>
        <DialogContent className="bg-[#1C1C1C] border-[#BBF717] text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-[#BBF717] flex items-center justify-center gap-2">
              <Smartphone className="w-5 h-5" />
              Instalar EXL Trading Hub
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-center text-gray-300 text-sm">
              Para instalar o app no seu iPhone, siga estes passos:
            </p>

            {/* Passo 1 */}
            <div className="flex items-start gap-3 p-3 bg-[#2C2C2C] rounded-lg">
              <div className="bg-[#BBF717] text-black rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
                1
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Share className="w-4 h-4 text-[#BBF717]" />
                  <span className="font-medium text-sm">
                    Toque em Compartilhar
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  Encontre o ícone de compartilhar (⬆️) na barra inferior do
                  Safari
                </p>
              </div>
            </div>

            {/* Passo 2 */}
            <div className="flex items-start gap-3 p-3 bg-[#2C2C2C] rounded-lg">
              <div className="bg-[#BBF717] text-black rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
                2
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Plus className="w-4 h-4 text-[#BBF717] " />
                  <span className="font-medium text-sm">
                    Adicionar à Tela de Início
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  Role para baixo e toque em "Adicionar à Tela de Início"
                </p>
              </div>
            </div>

            {/* Passo 3 */}
            <div className="flex items-start gap-3 p-3 bg-[#2C2C2C] rounded-lg">
              <div className="bg-[#BBF717] text-black rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">
                3
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Download className="w-4 h-4 text-[#BBF717]" />
                  <span className="font-medium text-sm">
                    Confirmar Instalação
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  Toque em "Adicionar" para instalar o app na sua tela inicial
                </p>
              </div>
            </div>

            <div className="bg-[#0E0E0E] p-3 rounded-lg border border-[#BBF717]/20">
              <p className="text-xs text-center text-gray-400">
                💡 <span className="text-[#BBF717]">Dica:</span> Após instalado,
                o app aparecerá na sua tela inicial como um app nativo!
              </p>
            </div>

            <Button
              onClick={() => setShowIOSModal(false)}
              className="w-full bg-[#BBF717] text-black hover:bg-[#9FD615]"
            >
              Entendi!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
