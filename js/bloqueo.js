// Función para verificar si el usuario está autenticado
function verificarAutenticacion() {
    const authToken = localStorage.getItem('authToken'); // Obtener el token guardado en localStorage

    // Si el token existe, el usuario está autenticado
    if (authToken) {
        desbloquearContenido(); // Mostrar contenido protegido
        mostrarTiempoRestante(); // Mostrar mensaje de periodo de prueba o acceso premium
    } else {
        bloquearContenido(); // Bloquear contenido si no hay token
    }
}

// Función para manejar el inicio de sesión
function manejarInicioSesion(token) {
    // Guardar el token en localStorage
    localStorage.setItem('authToken', token);

    // Llamar a la función que desbloquea el contenido
    desbloquearContenido();
}

// Función para mostrar contenido si el usuario está autenticado
function mostrarContenido() {
    const contenidoProtegido = document.getElementById('contenido_protegido'); // Obtener elemento del DOM
    if (contenidoProtegido) {
        contenidoProtegido.style.display = 'block'; // Mostrar el contenido protegido
    }

    document.getElementById('mensaje_bloqueo').style.display = 'none'; // Ocultar mensaje de bloqueo
}

// Función para bloquear el contenido si el usuario no está autenticado
function bloquearContenido() {
    document.getElementById('mensajeBloqueo').innerHTML = '🔐 Debes iniciar sesión con Google para acceder al contenido'; // Mostrar mensaje de bloqueo
    document.getElementById('contenidoApp').style.display = 'none'; // Ocultar contenido de la app
    document.getElementById('authorize_button').style.visibility = 'visible'; // Mostrar botón de autorización
    document.getElementById('signout_button').style.visibility = 'hidden'; // Ocultar botón de cerrar sesión

    // Limpiar el mensaje de periodo de prueba
    document.getElementById('mensajePeriodoPrueba').innerHTML = '';
}

// Función para desbloquear el contenido cuando el usuario está autenticado
function desbloquearContenido() {
    document.getElementById('mensajeBloqueo').innerHTML = ''; // Limpiar mensaje de bloqueo
    document.getElementById('contenidoApp').style.display = 'block'; // Mostrar contenido de la app
    document.getElementById('authorize_button').style.visibility = 'hidden'; // Ocultar botón de autorización
    document.getElementById('signout_button').style.visibility = 'visible'; // Mostrar botón de cerrar sesión

    // Mostrar el mensaje de periodo de prueba o acceso premium
    mostrarTiempoRestante();
}

// Función para manejar el cierre de sesión
function handleSignoutClick() {
    // Eliminar el token de localStorage
    localStorage.removeItem('authToken');

    // Verificar la autenticación y actualizar la UI
    verificarAutenticacion();
}

// Llamar a la función para verificar autenticación al cargar la página
window.onload = verificarAutenticacion;

// Asocia el evento de cierre de sesión al botón correspondiente
document.getElementById('signout_button').addEventListener('click', handleSignoutClick);
