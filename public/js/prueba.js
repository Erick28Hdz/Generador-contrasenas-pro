// ✅ Verifica si el usuario está autenticado por token
function estaAutenticado() {
  return localStorage.getItem("authToken") !== null;
}

// Función que muestra el estado del periodo de prueba o acceso premium
function mostrarTiempoRestante() {
  const mensaje = document.getElementById("mensajePeriodoPrueba");
  const plan = localStorage.getItem("planPremium");
  const finPremium = localStorage.getItem("finPremium");
  const diasRestantes = localStorage.getItem("diasRestantes");
  const nombreUsuario = localStorage.getItem("nombreUsuario");

  if (!mensaje) return;
  if (!estaAutenticado()) {
    mensaje.innerText = "";
    return;
  }

  const botonPremium = document.getElementById("botonPremium");
  if (plan === "Premium" && botonPremium) {
    botonPremium.style.display = "none";
  }

  let saludo = nombreUsuario ? `👋 Hola ${nombreUsuario}. ` : "";

  if (plan && finPremium) {
    const fin = new Date(finPremium);
    const hoy = new Date();

    const tiempoRestante = fin.getTime() - hoy.getTime();
    const diasRestantes = Math.ceil(tiempoRestante / (1000 * 60 * 60 * 24));

    const nombrePlan = localStorage.getItem("nombrePlan") || plan;

    if (fin > hoy) {
      if (plan === 'Prueba') {
        const saludoDiv = document.getElementById("saludoUsuario");
        saludoDiv.innerText = saludo;
        mensaje.innerText = `🧪 Te quedan ${diasRestantes} días de prueba (hasta el ${fin.toLocaleDateString()}).`;
        mensaje.style.color = 'orange';
      } else {
        const saludoDiv = document.getElementById("saludoUsuario");
        saludoDiv.innerText = saludo;
        mensaje.innerText = `🔓 ${nombrePlan} activo hasta el: ${fin.toLocaleDateString()}.`;
        mensaje.style.color = 'green';
      }
    } else {
      const saludoDiv = document.getElementById("saludoUsuario");
      saludoDiv.innerText = saludo;
      mensaje.innerText = `❌ Tu ${plan === 'Prueba' ? 'periodo de prueba' : 'membresía Premium'} ha expirado.`;
      mensaje.style.color = 'red';
    }
  }
}

// ✅ Función para activar premium verificando con el backend
async function activarPremiumConCodigo() {
  const codigo = document.getElementById('codigoPremium')?.value.trim() || await mostrarModalInput({
    titulo: '⭐ Código Premium',
    mensaje: 'Introduce el código Premium:',
    placeholder: 'Código Premium...'
  });

  if (!codigo) {
    mostrarMensaje("❌ Faltan datos: asegúrate de haber ingresado el código.");
    return;
  }

  try {
    // ✅ Solo verificamos el código
    const verificarResp = await fetch("https://generador-contrasenas-pro.onrender.com/api/verificarCodigo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codigo }), // 🔁 Solo el código
    });

    const verificarResultado = await verificarResp.json();

    if (!verificarResp.ok || !verificarResultado.premiumActivo) {
      mostrarMensaje(`❌ Código inválido: ${verificarResultado.error || "Código no válido"}`);
      return;
    }

    // ✅ Guardar localmente y actualizar UI
    mostrarMensaje(`✅ Acceso Premium Activado (${verificarResultado.plan})\nVálido hasta: ${new Date(verificarResultado.fin).toLocaleDateString()}`);
    localStorage.setItem("codigoPremium", codigo);
    localStorage.setItem("planPremium", verificarResultado.plan);
    localStorage.setItem("finPremium", verificarResultado.fin);

    mostrarTiempoRestante();

    const botonPremium = document.getElementById("botonPremium");
    if (botonPremium) botonPremium.style.display = "none";

  } catch (error) {
    console.error("❌ Error general:", error);
    mostrarMensaje("❌ Ocurrió un error al activar Premium");
  }
}







