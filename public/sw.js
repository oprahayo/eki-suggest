const VERSION = "v2"
const SHELL_CACHE = `ekisignal-shell-${VERSION}`
const RUNTIME_CACHE = `ekisignal-runtime-${VERSION}`
const DATA_CACHE = `ekisignal-data-${VERSION}`
const OFFLINE_URL = "/offline.html"
const APP_SHELL = [
  "/",
  "/reports",
  "/track",
  "/alerts",
  "/account",
  "/help",
  "/report/new",
  "/manifest.webmanifest",
  "/icons/apple-touch-icon.png",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-512.png",
  OFFLINE_URL,
]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      caches.keys().then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) =>
                ![SHELL_CACHE, RUNTIME_CACHE, DATA_CACHE].includes(key)
            )
            .map((key) => caches.delete(key))
        )
      ),
      self.registration.navigationPreload
        ? self.registration.navigationPreload.enable()
        : Promise.resolve(),
      self.clients.claim(),
    ])
  )
})

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting()
  }
})

async function putInCache(cacheName, request, response) {
  if (!response || (!response.ok && response.type !== "opaque")) {
    return response
  }

  const cache = await caches.open(cacheName)
  await cache.put(request, response.clone())
  return response
}

async function handleNavigation(event) {
  try {
    const preloadResponse = await event.preloadResponse

    if (preloadResponse) {
      return putInCache(RUNTIME_CACHE, event.request, preloadResponse)
    }

    const networkResponse = await fetch(event.request)
    return putInCache(RUNTIME_CACHE, event.request, networkResponse)
  } catch {
    const cachedResponse =
      (await caches.match(event.request)) ||
      (await caches.match("/")) ||
      (await caches.match(OFFLINE_URL))

    return cachedResponse
  }
}

async function handleStaticAsset(request) {
  const cachedResponse = await caches.match(request)
  const networkPromise = fetch(request)
    .then((response) => putInCache(RUNTIME_CACHE, request, response))
    .catch(() => cachedResponse)

  return cachedResponse || networkPromise
}

async function handleDataRequest(request) {
  try {
    const networkResponse = await fetch(request)
    return putInCache(DATA_CACHE, request, networkResponse)
  } catch {
    const cachedResponse = await caches.match(request)

    if (cachedResponse) {
      return cachedResponse
    }

    return new Response(JSON.stringify({ ok: false, offline: true }), {
      headers: {
        "Content-Type": "application/json",
      },
      status: 503,
    })
  }
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return
  }

  const url = new URL(event.request.url)
  const isSameOrigin = url.origin === self.location.origin

  if (event.request.mode === "navigate") {
    event.respondWith(handleNavigation(event))
    return
  }

  if (
    isSameOrigin &&
    (url.pathname.startsWith("/api/") || url.pathname.startsWith("/manifest"))
  ) {
    event.respondWith(handleDataRequest(event.request))
    return
  }

  if (
    event.request.destination === "style" ||
    event.request.destination === "script" ||
    event.request.destination === "worker" ||
    event.request.destination === "font" ||
    event.request.destination === "image"
  ) {
    event.respondWith(handleStaticAsset(event.request))
  }
})
