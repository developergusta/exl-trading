const CACHE_NAME = "exl-trading-v1";
const OFFLINE_URL = "/offline.html";

// Assets para cache
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-72x72.png",
  "/images/exl-logo.png",
  "/offline.html",
];

// Não fazer cache de URLs que contenham estes padrões
const NO_CACHE_PATTERNS = [
  /\/.well-known\//,
  /\/auth\//,
  /supabase/,
  /api/,
  /chrome-extension/,
  /^chrome-/,
  /extension/,
  /_next\/static.*webpack/, // Fix para erro 404 do webpack
  /hot-reload/,
  /sockjs/,
];

// URLs que devem sempre buscar da rede (bypass completo do SW)
const BYPASS_PATTERNS = [
  /supabase\.co/,
  /supabase\.io/,
  /amazonaws\.com/,
  /\/api\//,
  /\/auth\//,
];

// Verifica se a URL deve ser cacheada
function shouldCache(url) {
  // Ignora URLs que não são http(s)
  if (!url.startsWith("http")) return false;

  // Verifica se a URL não corresponde a nenhum padrão de não-cache
  return !NO_CACHE_PATTERNS.some((pattern) => pattern.test(url));
}

// Verifica se deve fazer bypass completo do SW
function shouldBypass(url) {
  return BYPASS_PATTERNS.some((pattern) => pattern.test(url));
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  // Ignora requisições não-HTTP(S)
  if (!event.request.url.startsWith("http")) {
    return;
  }

  // BYPASS COMPLETO para URLs críticas (Supabase, APIs, etc.)
  if (shouldBypass(event.request.url)) {
    return;
  }

  // Ignora requisições que não devem ser cacheadas
  if (!shouldCache(event.request.url)) {
    return;
  }

  // Only handle GET requests
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        // Retorna do cache e atualiza em background para static assets
        if (STATIC_ASSETS.some((asset) => event.request.url.includes(asset))) {
          fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse.ok) {
                caches
                  .open(CACHE_NAME)
                  .then((cache) => {
                    cache.put(event.request, networkResponse.clone());
                  })
                  .catch((error) => {
                    console.warn("Erro ao atualizar cache:", error);
                  });
              }
            })
            .catch(() => {
              // Ignora erros de rede ao atualizar cache
            });
        }
        return response;
      }

      // Se não está no cache, tenta buscar da rede
      return fetch(event.request)
        .then((response) => {
          if (!response || !response.ok) {
            return response;
          }

          // Só cacheia static assets
          if (
            STATIC_ASSETS.some((asset) => event.request.url.includes(asset))
          ) {
            const responseToCache = response.clone();

            caches
              .open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              })
              .catch((error) => {
                console.warn("Erro ao cachear resposta:", error);
              });
          }

          return response;
        })
        .catch(() => {
          // Se falhar e for uma navegação, retorna a página offline
          if (event.request.mode === "navigate") {
            return caches.match(OFFLINE_URL);
          }
          return new Response("Offline", { status: 503 });
        });
    })
  );
});

// ===== PUSH NOTIFICATIONS =====

// Listener para receber push notifications
self.addEventListener("push", (event) => {
  console.log("Push notification recebida:", event);

  let data = {};

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = {
        title: "EXL Trading Hub",
        body: event.data.text() || "Nova notificação",
        icon: "/icons/icon-192x192.png",
        badge: "/icons/icon-72x72.png",
      };
    }
  }

  const options = {
    title: data.title || "EXL Trading Hub",
    body: data.body || "Nova notificação",
    icon: data.icon || "/icons/icon-192x192.png",
    badge: data.badge || "/icons/icon-72x72.png",
    image: data.image,
    data: data.data || {},
    tag: data.tag || "exl-notification",
    requireInteraction: data.requireInteraction || false,
    actions: data.actions || [
      {
        action: "open",
        title: "Abrir App",
        icon: "/icons/icon-72x72.png",
      },
      {
        action: "close",
        title: "Fechar",
        icon: "/icons/icon-72x72.png",
      },
    ],
    vibrate: data.vibrate || [200, 100, 200],
    silent: data.silent || false,
  };

  event.waitUntil(self.registration.showNotification(options.title, options));
});

// Listener para cliques nas notificações
self.addEventListener("notificationclick", (event) => {
  console.log("Clique na notificação:", event);

  event.notification.close();

  if (event.action === "close") {
    return;
  }

  // Abre o app ou foca na aba existente
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Procura por uma aba já aberta do app
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            return client.focus();
          }
        }

        // Se não encontrar, abre uma nova aba
        if (clients.openWindow) {
          const urlToOpen = event.notification.data?.url || "/dashboard";
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Listener para fechar notificações
self.addEventListener("notificationclose", (event) => {
  console.log("Notificação fechada:", event);

  // Pode registrar analytics aqui se necessário
  event.waitUntil(
    fetch("/api/notifications/closed", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        notificationId: event.notification.tag,
        timestamp: new Date().toISOString(),
      }),
    }).catch(() => {
      // Ignora erros - analytics opcional
    })
  );
});

// Listener para subscription changes
self.addEventListener("pushsubscriptionchange", (event) => {
  console.log("Push subscription mudou:", event);

  event
    .waitUntil(
      self.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
            "BJBbeccXG6xElUWfINU0TmPpCavZtG7oIYsbzcfI75_QKbkyw4TxHBbBucgxDTVdiuTHJ8ZX9teAtcJucbv3vgQ"
        ),
      })
    )
    .then((subscription) => {
      // Envia nova subscription para o servidor
      return fetch("/api/push/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subscription),
      });
    })
    .catch((error) => {
      console.error("Erro ao renovar subscription:", error);
    });
});

// Função helper para converter VAPID key
function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
