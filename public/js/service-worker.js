// ✅ Evento 'install': Se dispara cuando el Service Worker se instala por primera vez
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open('pwacache').then(cache => {
      return cache.addAll([
        '/Generador-contrasenas-pro/index.html',
        '/Generador-contrasenas-pro/css/style.css',
        '/Generador-contrasenas-pro/js/auth.js',
        '/Generador-contrasenas-pro/js/main.js',
        '/Generador-contrasenas-pro/js/bloqueo.js',
        '/Generador-contrasenas-pro/js/cifrado.js',
        '/Generador-contrasenas-pro/js/prueba.js',
        '/Generador-contrasenas-pro/js/sheets.js',
        '/Generador-contrasenas-pro/manifest.json',
        '/Generador-contrasenas-pro/image/icon-256.png',
        '/Generador-contrasenas-pro/image/icon-512.png'
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
