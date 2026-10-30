// Service worker: o app abre offline depois da primeira visita.
// O build substitui os dois marcadores abaixo (lista de arquivos e versão).
const PRECACHE = /*PRECACHE*/ [];
const CACHE = "atleta-hibrido-" + /*BUILD*/ "dev";

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith(
    caches.match(request, { ignoreSearch: true }).then((cached) => cached || fetch(request).catch(() => caches.match("./index.html")))
  );
});
