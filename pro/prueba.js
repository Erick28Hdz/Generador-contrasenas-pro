// ✅ Constante que representa el código secreto para activar el modo Premium manualmente
const CODIGO_SECRETO = "erickvip123";

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
    mostrarTiempoRestante();

    // Desactivar o ocultar el botón "Activar Premium con código"
    const botonPremium = document.getElementById("botonPremium");
    if (botonPremium) botonPremium.style.display = "none";  // Oculta el botón
  } else {
    alert("❌ Código incorrecto");
  }
}

// Solo ejecutamos las funciones de prueba si el usuario está autenticado
if (estaAutenticado()) {
  mostrarTiempoRestante();
}

const botonPremium = document.getElementById("botonPremium");

// Si el usuario tiene el código Premium, ocultamos el botón
if (tieneCodigoPremium() && botonPremium) {
  botonPremium.style.display = "none";
}

// ✅ Función para verificar si el usuario está autenticado (puedes reusar esta del otro script)
function estaAutenticado() {
  return localStorage.getItem("authToken") !== null;
}
