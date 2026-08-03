const VERSION = "v1";
const PRECACHE = `trackgeek-precache-${VERSION}`;
const ASSETS = `trackgeek-assets-${VERSION}`;
const PAGES = `trackgeek-pages-${VERSION}`;

const OFFLINE_URL = "/offline.html";

const PRECACHE_URLS = [OFFLINE_URL, "/manifest.webmanifest", "/favicon.svg", "/logo.svg", "/icons/icon-192.png"];

const PAGES_LIMIT = 30;
const NETWORK_TIMEOUT = 6000;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PRECACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.enable();
      }

      const keys = await caches.keys();

      await Promise.all(keys.filter((key) => !key.endsWith(VERSION)).map((key) => caches.delete(key)));

      await self.clients.claim();
    })(),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

async function trim(cacheName, limit) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();

  for (const key of keys.slice(0, Math.max(0, keys.length - limit))) {
    await cache.delete(key);
  }
}

async function handleNavigation(event) {
  const cache = await caches.open(PAGES);

  try {
    const preload = await event.preloadResponse;
    const response =
      preload ||
      (await Promise.race([
        fetch(event.request),
        new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), NETWORK_TIMEOUT)),
      ]));

    if (response?.ok) {
      cache.put(event.request, response.clone());
      trim(PAGES, PAGES_LIMIT);
    }

    return response;
  } catch {
    const cached = (await cache.match(event.request)) || (await caches.match(OFFLINE_URL, { cacheName: PRECACHE }));

    return cached || Response.error();
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(ASSETS);
  const cached = await cache.match(request);

  if (cached) return cached;

  const response = await fetch(request);

  if (response.ok) {
    cache.put(request, response.clone());
  }

  return response;
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(ASSETS);
  const cached = await cache.match(request);

  const network = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }

      return response;
    })
    .catch(() => cached);

  return cached || network;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/_serverFn/")) return;

  if (request.mode === "navigate") {
    event.respondWith(handleNavigation(event));

    return;
  }

  if (url.pathname.startsWith("/assets/") || url.pathname.startsWith("/_build/")) {
    event.respondWith(cacheFirst(request));

    return;
  }

  if (["style", "script", "font", "image"].includes(request.destination)) {
    event.respondWith(staleWhileRevalidate(request));
  }
});
