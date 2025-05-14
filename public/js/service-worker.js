// ✅ Evento 'install': Se dispara cuando el Service Worker se instala por primera vez
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open('pwacache').then(cache => {
      return cache.addAll([
        '/',
        '/css/style.css',
        '/js/auth.js',
        '/js/main.js',
        '/js/bloqueo.js',
        '/js/cifrado.js',
        '/js/prueba.js',
        '/js/sheets.js',
        '/manifest.json',
        '/image/icon-256.png',
        '/image/icon-512.png'
      ]);
    })
  );
});

// ✅ Evento 'fetch': Se activa cada vez que la app hace una solicitud
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request);
    })
  );
});
