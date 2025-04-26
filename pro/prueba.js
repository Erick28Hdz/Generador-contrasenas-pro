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

  // Si tiene acceso Premium
  if (tieneCodigoPremium()) {
    mensaje.innerText = "🔓 Acceso Premium Activado.";
    mensaje.style.color = "green";  // Cambiar color a verde si Premium
    return;
  }

  const diasPrueba = 7;
  const inicioPrueba = localStorage.getItem("inicioPrueba");

  if (!inicioPrueba) {
    const hoy = new Date().toISOString();
    localStorage.setItem("inicioPrueba", hoy);
    mensaje.innerText = `🧪 Te quedan ${diasPrueba} días de prueba.`;
    mensaje.style.color = "orange";  // Color naranja durante el periodo de prueba
    return;
  }

  const inicio = new Date(inicioPrueba);
  const hoy = new Date();
  const diferenciaDias = Math.floor((hoy - inicio) / (1000 * 60 * 60 * 24));
  const diasRestantes = diasPrueba - diferenciaDias;

  if (diasRestantes <= 0) {
    mensaje.innerText = "❌ Tu periodo de prueba ha terminado.";
    mensaje.style.color = "red";  // Rojo cuando termina el periodo
  } else {
    mensaje.innerText = `🧪 Te quedan ${diasRestantes} días de prueba.`;
    mensaje.style.color = "orange";  // Naranja mientras queda tiempo
  }
}

// ✅ Permitir al usuario introducir el código premium
function activarPremiumConCodigo() {
  const codigo = prompt("Introduce el código premium:");
  if (codigo === CODIGO_SECRETO) {
    localStorage.setItem("codigoPremium", codigo);
    alert("✅ Acceso Premium Activado");
    mostrarTiempoRestante();
    mostrarContenidoSiAutenticado(); // Vuelve a mostrar el contenido
  } else {
    alert("❌ Código incorrecto");
  }
}

// ✅ Función para mostrar o bloquear el contenido según el estado
function mostrarContenidoSiAutenticado() {
  const contenido = document.getElementById("contenidoApp");
  const mensajeBloqueo = document.getElementById("mensajeBloqueo");

  if (!contenido || !mensajeBloqueo) return;

  if (!estaAutenticado()) {
    contenido.style.display = "none";
    mensajeBloqueo.innerText = "🔐 Debes iniciar sesión con Google para acceder al contenido.";
    return;
  }

  // Usuario autenticado: validamos si tiene permiso (prueba o premium)
  if (tieneCodigoPremium() || verificarSiEstaEnPeriodoDePrueba()) {
    contenido.style.display = "block";
    mensajeBloqueo.innerText = "";
  } else {
    contenido.style.display = "none";
    mensajeBloqueo.innerText = "⏳ Tu periodo de prueba ha terminado. Ingresa un código Premium.";
  }
}

// ✅ Al cargar la página, evaluamos el acceso y mostramos estado
window.onload = () => {
  // Verificar si el usuario está autenticado y mostrar el mensaje de prueba
  mostrarContenidoSiAutenticado();

  // Llamamos a mostrarTiempoRestante solo si el usuario está autenticado
  if (estaAutenticado()) {
    mostrarTiempoRestante();
  }

  // 🔐 Ocultar botón de login si ya está autenticado
  const botonLogin = document.getElementById("loginGoogle");
  if (estaAutenticado() && botonLogin) {
    botonLogin.style.display = "none";
  }
};
