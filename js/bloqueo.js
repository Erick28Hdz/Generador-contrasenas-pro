// Función para verificar si el usuario está autenticado
function verificarAutenticacion() {
    // Se obtiene el token de autenticación almacenado en el navegador (localStorage)
    const authToken = localStorage.getItem('authToken');

    // Si existe el token, se desbloquea el contenido; si no, se bloquea
    authToken ? desbloquearContenido() : bloquearContenido();
}

// Función para desbloquear el contenido (cuando el usuario está autenticado)
function desbloquearContenido() {
    // Se obtienen los elementos del DOM necesarios para mostrar el contenido
    const contenido = document.getElementById('contenidoApp');           // Contenedor principal del contenido
    const mensajeBloqueo = document.getElementById('mensajeBloqueo');   // Mensaje que se muestra cuando el acceso está bloqueado
    const authorizeBtn = document.getElementById('authorize_button');   // Botón para autorizar/iniciar sesión
    const signoutBtn = document.getElementById('signout_button');       // Botón para cerrar sesión

    // Se muestra el contenido de la aplicación
    contenido.style.display = 'block';

    // Se limpia cualquier mensaje de bloqueo anterior
    mensajeBloqueo.innerHTML = '';

    // Se oculta el botón de autorización
    authorizeBtn.style.visibility = 'hidden';

    // Se muestra el botón para cerrar sesión
    signoutBtn.style.visibility = 'visible';

    // Se llama a una función para mostrar el tiempo restante (si aplica)
    mostrarTiempoRestante(); // Esta función debe estar definida en otro lugar si es que se usa
}

// Función para bloquear el contenido (cuando el usuario no está autenticado)
function bloquearContenido() {
    // Se obtienen los mismos elementos del DOM que en la función anterior
    const contenido = document.getElementById('contenidoApp');
    const mensajeBloqueo = document.getElementById('mensajeBloqueo');
    const authorizeBtn = document.getElementById('authorize_button');
    const signoutBtn = document.getElementById('signout_button');
    const periodoPrueba = document.getElementById('mensajePeriodoPrueba'); // Mensaje para periodo de prueba (opcional)

    // Se muestra un mensaje indicando que se debe iniciar sesión
    mensajeBloqueo.innerHTML = '🔐 Debes iniciar sesión con Google para acceder al contenido';

    // Se oculta el contenido de la aplicación
    contenido.style.display = 'none';

    // Se muestra el botón para autorizar/iniciar sesión
    authorizeBtn.style.visibility = 'visible';

    // Se oculta el botón para cerrar sesión
    signoutBtn.style.visibility = 'hidden';

    // Si existe el mensaje de periodo de prueba, se limpia su contenido
    if (periodoPrueba) periodoPrueba.innerHTML = '';
}

// Función para cerrar sesión
function cerrarSesion() {
    // Se elimina el token de autenticación del localStorage
    localStorage.removeItem('authToken');

    // Se vuelve a verificar si el usuario está autenticado (para actualizar la interfaz)
    verificarAutenticacion();
}

// Eventos y ejecución inicial

// Al cargar completamente la página, se verifica si el usuario está autenticado
window.onload = verificarAutenticacion;

// Se agrega un evento al botón de cerrar sesión para ejecutar la función `cerrarSesion` al hacer clic
document.getElementById('signout_button').addEventListener('click', cerrarSesion);
