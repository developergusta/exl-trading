"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
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

  useEffect(() => {
    // Detectar iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);

    // Verificar se está no modo standalone
    const standalone = window.matchMedia("(display-mode: standalone)").matches;
    setIsStandalone(standalone);

    // Listen for beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstallClick = async () => {
    // Para iOS Safari
    if (isIOS) {
      alert(
        "Para instalar o app no iOS:\n\n" +
          "1. Toque no ícone de compartilhar (⬆️) na barra inferior\n" +
          "2. Role para baixo e toque em 'Adicionar à Tela de Início'\n" +
          "3. Toque em 'Adicionar' para confirmar"
      );
      return;
    }

    // Para Android/Chrome
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
    } else {
      // Fallback para outros navegadores
      alert(
        "Para instalar o app:\n\n" +
          "• Chrome: Menu (⋮) > 'Instalar aplicativo' ou 'Adicionar à tela inicial'\n" +
          "• Firefox: Menu (☰) > 'Instalar'\n" +
          "• Safari: Compartilhar (⬆️) > 'Adicionar à Tela de Início'"
      );
    }
  };

  return (
    <Button
      onClick={handleInstallClick}
      className="bg-[#BBF717] text-black hover:bg-[#9FD615] text-sm w-full mt-2"
    >
      <Download className="w-4 h-4 mr-2" />
      Instalar App
    </Button>
  );
}
