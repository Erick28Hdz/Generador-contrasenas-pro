// ✅ Evento 'install': Se dispara cuando el Service Worker se instala por primera vez
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open('pwacache').then(cache => {
      return cache.addAll([
        'index.html',             // 📄 Página principal
        '/css/style.css',          // 🎨 Estilos
        '/js/auth.js',             // ⚙️ Scripts JS
        '/js/main.js',
        '/js/bloqueo.js',
        '/js/cifrado.js',
        '/js/prueba.js',
        '/ja/sheets.js',
        '/js/manifest.json',          // 📜 Manifiesto (asegúrate de tenerlo en la raíz)
        '/image/icon-256.png',           // 🖼️ Íconos (asegúrate de tenerlos en la raíz)
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
