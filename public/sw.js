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
];

// Verifica se a URL deve ser cacheada
function shouldCache(url) {
  // Ignora URLs que não são http(s)
  if (!url.startsWith("http")) return false;

  // Verifica se a URL não corresponde a nenhum padrão de não-cache
  return !NO_CACHE_PATTERNS.some((pattern) => pattern.test(url));
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

  // Ignora requisições que não devem ser cacheadas
  if (!shouldCache(event.request.url)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        // Retorna do cache e atualiza em background
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse.ok) {
              caches
                .open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, networkResponse);
                })
                .catch((error) => {
                  console.warn("Erro ao atualizar cache:", error);
                });
            }
          })
          .catch(() => {
            // Ignora erros de rede ao atualizar cache
          });
        return response;
      }

      // Se não está no cache, tenta buscar da rede
      return fetch(event.request)
        .then((response) => {
          if (!response || !response.ok) {
            return response;
          }

          // Clona a resposta antes de cachear
          const responseToCache = response.clone();

          // Tenta cachear em background
          caches
            .open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            })
            .catch((error) => {
              console.warn("Erro ao cachear resposta:", error);
            });

          return response;
        })
        .catch(() => {
          // Se falhar e for uma navegação, retorna a página offline
          if (event.request.mode === "navigate") {
            return caches.match(OFFLINE_URL);
          }
          return new Response("Offline");
        });
    })
  );
});
