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
            // Novo Service Worker disponível
            if (confirm("Nova versão disponível! Deseja atualizar agora?")) {
              window.location.reload();
            }
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

  // Função para lidar com reconexão
  async function handleReconnection() {
    if (navigator.onLine) {
      // Tenta registrar novamente o Service Worker
      const success = await registerServiceWorker();
      if (success) {
        // Se conseguiu registrar, recarrega a página
        window.location.reload();
      }
    }
  }

  // Inicialização
  window.addEventListener("load", async () => {
    await registerServiceWorker();

    // Verifica atualizações a cada 30 minutos
    setInterval(checkForUpdates, 30 * 60 * 1000);
  });

  // Gerenciamento de estado online/offline
  let wasOffline = !navigator.onLine;

  window.addEventListener("online", async () => {
    if (wasOffline) {
      wasOffline = false;
      await handleReconnection();
    }
  });

  window.addEventListener("offline", () => {
    wasOffline = true;
  });

  // Adiciona listener para erros de rede
  window.addEventListener("unhandledrejection", async (event) => {
    if (
      event.reason &&
      event.reason.message &&
      (event.reason.message.includes("fetch") ||
        event.reason.message.includes("network"))
    ) {
      // Tenta reconectar em caso de erros de rede
      await handleReconnection();
    }
  });
}
