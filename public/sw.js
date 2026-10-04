const NAMA_CACHE = "mediabaca-v1";
const HALAMAN_DASAR = ["/", "/jelajahi", "/manifest.json"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(NAMA_CACHE).then((c) => c.addAll(HALAMAN_DASAR)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== NAMA_CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  if (url.pathname.startsWith("/dasbor") || url.pathname.startsWith("/admin") || url.pathname.startsWith("/editor")) return;

  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const salinan = res.clone();
        caches.open(NAMA_CACHE).then((c) => c.put(e.request, salinan));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
