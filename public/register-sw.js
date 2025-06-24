if ("serviceWorker" in navigator) {
  let registration = null;

  async function registerServiceWorker() {
    try {
      registration = await navigator.serviceWorker.register("/sw.js");
      console.log("Service Worker registrado com sucesso:", registration);

      // Atualiza o service worker imediatamente se houver uma nova versão
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        newWorker.addEventListener("statechange", () => {
          if (
            newWorker.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            // Novo Service Worker disponível - não força reload automático
            console.log("Nova versão do Service Worker disponível");
            // Opcionalmente pode mostrar uma notificação ao usuário
          }
        });
      });

      return true;
    } catch (error) {
      console.error("Erro ao registrar Service Worker:", error);
      return false;
    }
  }

  // Função para verificar e atualizar o Service Worker
  async function checkForUpdates() {
    try {
      if (registration) {
        await registration.update();
      }
    } catch (error) {
      console.warn("Erro ao verificar atualizações do SW:", error);
    }
  }

  // Inicialização
  window.addEventListener("load", async () => {
    await registerServiceWorker();

    // Verifica atualizações a cada 30 minutos
    setInterval(checkForUpdates, 30 * 60 * 1000);
  });

  // Gerenciamento de estado online/offline - SEM RELOAD AUTOMÁTICO
  let wasOffline = !navigator.onLine;

  window.addEventListener("online", async () => {
    if (wasOffline) {
      wasOffline = false;
      console.log("Conexão restaurada");
      // Não recarrega mais automaticamente
    }
  });

  window.addEventListener("offline", () => {
    wasOffline = true;
    console.log("Conexão perdida");
  });

  // Remove listener que causava reloads desnecessários
  // O erro de fetch será tratado pela aplicação
}
