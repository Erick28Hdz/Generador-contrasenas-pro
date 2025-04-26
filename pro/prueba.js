// ✅ Constante que representa el código secreto para activar el modo Premium manualmente
const CODIGO_SECRETO = "erickvip123";

// ✅ Función que verifica si el usuario ha iniciado sesión (autenticado)
function estaAutenticado() {
  return localStorage.getItem("usuarioRegistrado") === "true";
}

// ✅ Función que verifica si el usuario ha ingresado el código Premium correctamente
function tieneCodigoPremium() {
  return localStorage.getItem("codigoPremium") === CODIGO_SECRETO;
}

// ✅ Función que verifica si el usuario todavía está dentro del periodo de prueba de 7 días
function verificarSiEstaEnPeriodoDePrueba() {
  const inicioPrueba = localStorage.getItem("inicioPrueba");
  if (!inicioPrueba) return false;

  const inicio = new Date(inicioPrueba);
  const hoy = new Date();
  const diferenciaDias = Math.floor((hoy - inicio) / (1000 * 60 * 60 * 24));
  return diferenciaDias < 7;
}

// ✅ Función que muestra el estado del periodo de prueba o acceso premium
function mostrarTiempoRestante() {
  const mensaje = document.getElementById("mensajePeriodoPrueba");
  if (!mensaje) return;

  if (!estaAutenticado()) {
    mensaje.innerText = "";
    return;
  }

  // Si tiene acceso Premium
  if (tieneCodigoPremium()) {
    mensaje.innerText = "🔓 Acceso Premium Activado.";
    mensaje.style.color = "green";
    return;
  }

  const diasPrueba = 7;
  let inicioPrueba = localStorage.getItem("inicioPrueba");

  // ⚠️ Solo crear inicioPrueba si el usuario está autenticado
  if (!inicioPrueba && estaAutenticado()) {
    const hoy = new Date().toISOString();
    localStorage.setItem("inicioPrueba", hoy);
    inicioPrueba = hoy;
  }

  if (!inicioPrueba) return;

  const inicio = new Date(inicioPrueba);
  const hoy = new Date();
  const diferenciaDias = Math.floor((hoy - inicio) / (1000 * 60 * 60 * 24));
  const diasRestantes = diasPrueba - diferenciaDias;

  if (diasRestantes <= 0) {
    mensaje.innerText = "❌ Tu periodo de prueba ha terminado.";
    mensaje.style.color = "red";
  } else {
    mensaje.innerText = `🧪 Te quedan ${diasRestantes} días de prueba.`;
    mensaje.style.color = "orange";
  }
}

// ✅ Permitir al usuario introducir el código premium
function activarPremiumConCodigo() {
  const codigo = prompt("Introduce el código premium:");
  if (codigo === CODIGO_SECRETO) {
    localStorage.setItem("codigoPremium", codigo);
    alert("✅ Acceso Premium Activado");

    // 🔄 Actualizar contenido al instante sin recargar
    mostrarContenidoSiAutenticado();
    mostrarTiempoRestante();

    // Desactivar o ocultar el botón "Activar Premium con código"
    const botonPremium = document.getElementById("botonPremium");
    if (botonPremium) botonPremium.style.display = "none";  // Oculta el botón
  } else {
    alert("❌ Código incorrecto");
  }
}

// ✅ Función para mostrar o bloquear el contenido según el estado
function mostrarContenidoSiAutenticado() {
  const contenido = document.getElementById("contenidoApp");
  const mensajeBloqueo = document.getElementById("mensajeBloqueo");
  const botonPremium = document.getElementById("botonPremium");

  if (!contenido || !mensajeBloqueo || !botonPremium) return;

  // Si no está autenticado, ocultamos el contenido y mostramos el mensaje
  if (!estaAutenticado()) {
    contenido.style.display = "none";
    mensajeBloqueo.innerText = "🔐 Debes iniciar sesión con Google para acceder al contenido";
    
    // Aseguramos que el botón "Activar Premium con código" solo se muestra cuando está autenticado
    botonPremium.style.display = "none"; // Ocultamos el botón si no está autenticado
    return;
  }

  // Si está autenticado, mostramos el contenido adecuado
  if (tieneCodigoPremium() || verificarSiEstaEnPeriodoDePrueba()) {
    contenido.style.display = "block";
    mensajeBloqueo.innerText = "";
  } else {
    contenido.style.display = "none";
    mensajeBloqueo.innerText = "⏳ Tu periodo de prueba ha terminado. Ingresa un código Premium.";
  }

  // Si ya tiene el acceso Premium, ocultamos el botón
  if (tieneCodigoPremium()) {
    botonPremium.style.display = "none"; // Ocultamos el botón
  } else {
    botonPremium.style.display = "inline-block"; // Mostramos el botón si no tiene premium
  }
}

// ✅ Al cargar la página, evaluamos el acceso y mostramos estado
window.onload = () => {
  mostrarContenidoSiAutenticado();

  if (estaAutenticado()) {
    mostrarTiempoRestante();
  }

  const botonLogin = document.getElementById("loginGoogle");
  const botonPremium = document.getElementById("botonPremium");

  // Ocultar el botón de login si el usuario ya está autenticado
  if (estaAutenticado() && botonLogin) {
    botonLogin.style.display = "none";
  }

  // Solo mostrar el botón Premium si el usuario está autenticado
  if (estaAutenticado() && botonPremium) {
    botonPremium.style.display = "inline-block";  // Mostrar el botón de premium solo si está autenticado
  }
};
