// ✅ Evento 'install': Se dispara cuando el Service Worker se instala por primera vez
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open('pwacache').then(cache => {
      return cache.addAll([
        '/Generador-contrasenas-pro/public/index.html',
        '/Generador-contrasenas-pro/public/css/style.css',
        '/Generador-contrasenas-pro/public/js/auth.js',
        '/Generador-contrasenas-pro/public/js/main.js',
        '/Generador-contrasenas-pro/public/js/bloqueo.js',
        '/Generador-contrasenas-pro/public/js/cifrado.js',
        '/Generador-contrasenas-pro/public/js/prueba.js',
        '/Generador-contrasenas-pro/public/js/sheets.js',
        '/Generador-contrasenas-pro/public/manifest.json',
        '/Generador-contrasenas-pro/public/image/icon-256.png',
        '/Generador-contrasenas-pro/public/image/icon-512.png'
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
