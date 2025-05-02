// ✅ Evento 'install': Se dispara cuando el Service Worker se instala por primera vez
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open('pwacache').then(cache => {
      return cache.addAll([
        'index.html',             // 📄 Página principal
        'css/style.css',          // 🎨 Estilos
        'auth.js',             // ⚙️ Scripts JS
        'main.js',
        'bloqueo.js',
        'cifrado.js',
        'prueba.js',
        'sheets.js',
        'imagen1.png',      // 🖼️ Imágenes
        'imagen2.png',
        'manifest.json',          // 📜 Manifiesto (asegúrate de tenerlo en la raíz)
        'icon-256.png',           // 🖼️ Íconos (asegúrate de tenerlos en la raíz)
        'icon-512.png'
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
