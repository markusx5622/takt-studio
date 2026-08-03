// Takt Studio — Service Worker
// Estrategia:
//  - Precache del shell offline (offline.html, iconos, manifest).
//  - Navegaciones: network-first; si la red falla, página cacheada o fallback offline.
//    El middleware localiza con 307 (/ruta ↔ /en/ruta según cookie/Accept-Language),
//    así que cacheamos bajo la URL final de la respuesta y, al fallar la red,
//    probamos las variantes de locale de esa ruta antes del fallback.
//  - _next/static (assets hasheados e inmutables): cache-first.
//  - Resto de estáticos same-origin (public/): stale-while-revalidate.
// Versionar CACHE_VERSION al cambiar el shell precacheado o esta lógica.

const CACHE_VERSION = "v1"
const PRECACHE = `takt-precache-${CACHE_VERSION}`
const RUNTIME = `takt-runtime-${CACHE_VERSION}`

const PRECACHE_URLS = [
  "/offline.html",
  "/manifest.webmanifest",
  "/icon-192.png",
  "/icon-512.png",
  "/maskable-icon-512.png",
  "/favicon.svg",
]

// Variantes de URL bajo las que el middleware puede haber servido una ruta:
//   /simulador ↔ /es/simulador ↔ /en/simulador
function navigationCandidates(requestUrl) {
  const u = new URL(requestUrl)
  const out = [u.href]
  const bare = u.pathname.replace(/^\/(es|en)(?=\/|$)/, "") || "/"
  const esUrl = u.origin + (bare === "/" ? "/" : bare)
  const enUrl = u.origin + (bare === "/" ? "/en" : `/en${bare}`)
  if (!out.includes(esUrl)) out.push(esUrl)
  if (!out.includes(enUrl)) out.push(enUrl)
  return out
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PRECACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== PRECACHE && key !== RUNTIME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  )
})

self.addEventListener("fetch", (event) => {
  const { request } = event

  if (request.method !== "GET") return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  // Navegaciones (HTML): network-first con fallback offline
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone()
            const key = response.redirected && response.url ? response.url : request.url
            caches.open(RUNTIME).then((cache) => cache.put(key, copy).catch(() => {}))
          }
          return response
        })
        .catch(async () => {
          const cache = await caches.open(RUNTIME)
          for (const candidate of navigationCandidates(request.url)) {
            const hit = await cache.match(candidate)
            if (hit) return hit
          }
          return caches.match("/offline.html")
        })
    )
    return
  }

  // Assets inmutables de Next: cache-first
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone()
              caches.open(RUNTIME).then((cache) => cache.put(request, copy).catch(() => {}))
            }
            return response
          })
      )
    )
    return
  }

  // Resto de estáticos same-origin: stale-while-revalidate
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone()
            caches.open(RUNTIME).then((cache) => cache.put(request, copy).catch(() => {}))
          }
          return response
        })
        .catch(() => cached)
      return cached || network
    })
  )
})
