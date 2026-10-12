// Sajjadia service worker
//
// What it does:
// - Pages always come from the network first, so content is never stale.
//   A copy of each visited page is kept so it can still open without a
//   connection. With no copy, a small offline page is shown.
// - Build files in /_astro/ (scripts, styles, fonts, optimized images) never
//   change once published, so they're served from the phone's cache.
// - Everything else is left alone: form submissions, /api/ routes, and other
//   websites (Sanity images, YouTube, Donorbox, Cloudflare Turnstile).
//
// To make every phone drop its saved copies (for example after a big
// redesign), change VERSION and deploy.
//
// Emergency off switch: replace this whole file with
//   self.addEventListener("install", () => self.skipWaiting());
//   self.addEventListener("activate", async () => {
//     for (const key of await caches.keys()) await caches.delete(key);
//     await self.registration.unregister();
//   });
// and deploy. Phones remove the service worker on their next visit.

const VERSION = "v1";
const PAGES = `sajjadia-pages-${VERSION}`;
const ASSETS = `sajjadia-assets-${VERSION}`;
const OFFLINE_URL = "/offline.html";
const PRECACHE = [OFFLINE_URL, "/apple-touch-icon.png"];

const MAX_PAGES = 30;
const MAX_ASSETS = 150;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PAGES)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Remove caches from older versions
      for (const key of await caches.keys()) {
        if (key.startsWith("sajjadia-") && key !== PAGES && key !== ASSETS) {
          await caches.delete(key);
        }
      }
      // Lets the page request start while the service worker is waking up
      if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.enable();
      }
      await self.clients.claim();
    })(),
  );
});

// Keep a cache from growing forever: drop the oldest entries
async function trimCache(name, max) {
  const cache = await caches.open(name);
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - max; i++) {
    await cache.delete(keys[i]);
  }
}

async function handlePage(event) {
  try {
    const response = (await event.preloadResponse) || (await fetch(event.request));
    // Save a copy of normal pages (not redirects or errors)
    if (response.ok && response.type === "basic" && !response.redirected) {
      const copy = response.clone();
      event.waitUntil(
        caches
          .open(PAGES)
          .then((cache) => cache.put(event.request, copy))
          .then(() => trimCache(PAGES, MAX_PAGES)),
      );
    }
    return response;
  } catch {
    // Offline: the saved copy of this page, or the offline page
    return (
      (await caches.match(event.request, { ignoreSearch: true })) ||
      (await caches.match(OFFLINE_URL)) ||
      Response.error()
    );
  }
}

async function handleAsset(event) {
  const cached = await caches.match(event.request);
  if (cached) return cached;

  const response = await fetch(event.request);
  if (response.ok) {
    const copy = response.clone();
    event.waitUntil(
      caches
        .open(ASSETS)
        .then((cache) => cache.put(event.request, copy))
        .then(() => trimCache(ASSETS, MAX_ASSETS)),
    );
  }
  return response;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith(handlePage(event));
    return;
  }

  if (url.pathname.startsWith("/_astro/")) {
    event.respondWith(handleAsset(event));
  }
});
