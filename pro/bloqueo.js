// Función para verificar si el usuario está autenticado
function verificarAutenticacion() {
    const authToken = localStorage.getItem('authToken');

    // Si el token existe, el usuario está autenticado
    if (authToken) {
        desbloquearContenido();
        mostrarTiempoRestante();
    } else {
        bloquearContenido();
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
    const contenidoProtegido = document.getElementById('contenido_protegido');
    if (contenidoProtegido) {
        contenidoProtegido.style.display = 'block';
    }

    document.getElementById('mensaje_bloqueo').style.display = 'none'; // Ocultar mensaje de bloqueo
}

// Función para bloquear el contenido si el usuario no está autenticado
function bloquearContenido() {
    document.getElementById('mensajeBloqueo').innerHTML = '🔐 Debes iniciar sesión con Google para acceder al contenido';
    document.getElementById('contenidoApp').style.display = 'none';
    document.getElementById('authorize_button').style.visibility = 'visible';
    document.getElementById('signout_button').style.visibility = 'hidden';

    // Limpiar el mensaje de periodo de prueba
    document.getElementById('mensajePeriodoPrueba').innerHTML = '';
}

// Función para desbloquear el contenido cuando el usuario está autenticado
function desbloquearContenido() {
    document.getElementById('mensajeBloqueo').innerHTML = '';
    document.getElementById('contenidoApp').style.display = 'block';
    document.getElementById('authorize_button').style.visibility = 'hidden';
    document.getElementById('signout_button').style.visibility = 'visible';

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
