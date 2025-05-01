// ✅ Evento 'install': Se dispara cuando el Service Worker se instala por primera vez
self.addEventListener('install', e => {
  // 🔄 Espera a que el contenido se agregue al caché antes de completar la instalación
  e.waitUntil(
    // 📦 Abre (o crea si no existe) un caché llamado 'pwacache'
    caches.open('pwacache').then(cache => {
      // 📁 Agrega todos los archivos necesarios para trabajar sin conexión (offline)
      return cache.addAll([
        'index.html',      // 📄 Archivo principal HTML
        'style.css',       // 🎨 Hoja de estilos
        'app.js',          // ⚙️ Lógica de la aplicación
        'manifest.json',   // 📜 Manifiesto de la PWA (íconos, nombre, etc.)
        'icon-256.png',    // 🖼️ Ícono de tamaño 256x256
        'icon-512.png'     // 🖼️ Ícono de tamaño 512x512
      ]);
    })
  );
});

// ✅ Evento 'fetch': Se activa cada vez que la app hace una solicitud (por ejemplo, al cargar imágenes, HTML, JS, etc.)
self.addEventListener('fetch', e => {
  // 🔁 Intenta responder primero con los archivos del caché
  // 🧭 Si no encuentra nada en caché, realiza la solicitud normal a internet
  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request); // Devuelve la respuesta en caché o hace la petición online
    })
  );
});
