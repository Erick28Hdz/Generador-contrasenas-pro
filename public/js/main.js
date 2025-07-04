let cuentaRegresivaInterval;
// Variable global para manejar el intervalo de cuenta regresiva, 
// así podemos detenerlo cuando expire o se limpie.

function mostrarMensaje(mensaje) {
  // Función reutilizable para mostrar mensajes temporales al usuario.
  const mensajeEl = document.getElementById('mensaje');
  mensajeEl.innerText = mensaje;
  mensajeEl.style.display = 'block';

  // Se oculta automáticamente a los 3 segundos para evitar saturar la pantalla.
  setTimeout(() => {
    mensajeEl.style.display = 'none';
  }, 3000);
}

// Función principal para generar contraseñas.
function generatePassword() {
  

  // Obtiene las configuraciones seleccionadas por el usuario.
  const length = parseInt(document.getElementById('length').value);
  const useUpper = document.getElementById('uppercase').checked;
  const useLower = document.getElementById('lowercase').checked;
  const useNumbers = document.getElementById('numbers').checked;
  const useSymbols = document.getElementById('symbols').checked;
  const noAmbiguous = document.getElementById('no-ambiguous').checked;

  // Valida que la longitud esté entre 8 y 64 para seguridad.
  if (isNaN(length) || length < 8 || length > 64) {
    mostrarMensaje("Por seguridad, usa entre 8 y 64 caracteres.");
    return;
  }

  // Valida que el tiempo de expiración sea un número positivo.
  const expirationMinutes = parseInt(document.getElementById('expTime').value);
  if (isNaN(expirationMinutes) || expirationMinutes < 0) {
    mostrarMensaje("Ingresa un tiempo de expiración válido (0 o mayor).");
    return;
  }

  // Define los conjuntos de caracteres disponibles.
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*()_-+[]{}<>?";
  const ambiguous = "O0Il1"; // Evitar confusiones entre O/0, I/l/1.

  let chars = "";
  if (useUpper) chars += upper;
  if (useLower) chars += lower;
  if (useNumbers) chars += numbers;
  if (useSymbols) chars += symbols;

  // Si se elige evitar caracteres ambiguos, se filtran.
  if (noAmbiguous) {
    chars = chars.split('').filter(c => !ambiguous.includes(c)).join('');
  }

  // Si no se seleccionó ningún tipo de carácter, no se puede generar.
  if (chars.length === 0) {
    mostrarMensaje("Selecciona al menos un tipo de carácter.");
    return;
  }

  // Genera la contraseña aleatoria usando los caracteres válidos.
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  // Muestra la contraseña generada en pantalla.
  const resultEl = document.getElementById('result');
  resultEl.innerText = password;
  resultEl.classList.remove("expired"); // Limpia estado anterior (expirada).

  // 🔄 Reinicia la bandera al generar una nueva contraseña
  passwordAlreadySaved = false;

  // Permite al usuario decidir si mostrarla desenfocada o visible.
  const showPassword = document.getElementById('togglePassword').checked;
  resultEl.style.filter = showPassword ? 'none' : 'blur(5px)';

  // Si hay expiración, guarda en localStorage y lanza cuenta regresiva.
  if (expirationMinutes > 0) {
    const expirationTime = new Date(new Date().getTime() + expirationMinutes * 60000);
    savePasswordWithExpiration(password, expirationTime);
    iniciarCuentaRegresiva(expirationTime);
  } else {
    document.getElementById('timer').innerText = '';
    limpiarCuentaRegresiva();
  }
}

// Guarda contraseña y expiración en localStorage.
function savePasswordWithExpiration(password, expirationTime) {
  let passwordsList = JSON.parse(localStorage.getItem("passwordList")) || [];
  passwordsList.push({ password, expirationTime });
  localStorage.setItem("passwordList", JSON.stringify(passwordsList));
}

// Maneja la cuenta regresiva visible al usuario.
function iniciarCuentaRegresiva(expiracion) {
  limpiarCuentaRegresiva(); // Evita duplicar intervalos.

  cuentaRegresivaInterval = setInterval(() => {
    const ahora = new Date();
    const tiempoRestante = expiracion - ahora;

    if (tiempoRestante <= 0) {
      clearInterval(cuentaRegresivaInterval);
      const resultEl = document.getElementById('result');
      resultEl.innerText = "⚠️ Contraseña expirada.";
      resultEl.classList.add("expired");
      document.getElementById('timer').innerText = "";
      localStorage.removeItem("passwordList"); // Elimina expiradas.
    } else {
      // Calcula días, horas, minutos, segundos.
      const dias = Math.floor(tiempoRestante / (1000 * 60 * 60 * 24));
      const horas = Math.floor((tiempoRestante % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutos = Math.floor((tiempoRestante % (1000 * 60 * 60)) / (1000 * 60));
      const segundos = Math.floor((tiempoRestante % (1000 * 60)) / 1000);

      document.getElementById('timer').innerText =
        `⏳ Expira en ${dias}d ${horas}h ${minutos}m ${segundos}s`;
    }
  }, 1000);
}

// Limpia el intervalo activo para evitar errores o fugas de memoria.
function limpiarCuentaRegresiva() {
  clearInterval(cuentaRegresivaInterval);
}

// Copiar contraseña al portapapeles
function copyPassword() {
  const password = document.getElementById('result').innerText;
  if (password && password !== "⚠️ Contraseña expirada.") {
    navigator.clipboard.writeText(password).then(() => {
      mostrarMensaje('✅ Contraseña copiada al portapapeles');
    }).catch(err => {
      console.error('❌ Error al copiar la contraseña:', err);
      mostrarMensaje('❌ Error al copiar la contraseña');
    });
  } else {
    mostrarMensaje('⚠️ No hay contraseña válida para copiar.');
  }
}

// Borra las contraseñas guardadas y limpia la interfaz.
function clearPasswords() {
  localStorage.removeItem("passwordList");
  document.getElementById('result').innerText = '';
  document.getElementById('timer').innerText = '';
  limpiarCuentaRegresiva();
  mostrarMensaje("Contraseñas eliminadas.");
}

// Revisa localStorage y elimina contraseñas que ya expiraron.
function checkExpiration() {
  let passwordsList = JSON.parse(localStorage.getItem("passwordList")) || [];
  const now = new Date();

  passwordsList = passwordsList.filter(entry => {
    const expirationDate = new Date(entry.expirationTime);
    if (now > expirationDate) {
      console.log(`La contraseña ${entry.password} ha expirado y se eliminó.`);
      return false;
    }
    return true;
  });

  localStorage.setItem("passwordList", JSON.stringify(passwordsList));
  console.log("Contraseñas activas:", passwordsList);
}

// Cambia el estado de visibilidad (oculto/desenfocado) de la contraseña.
function togglePasswordVisibility() {
  const el = document.getElementById('result');
  el.style.filter = document.getElementById('togglePassword').checked ? 'none' : 'blur(5px)';
}

// Obtiene contraseñas de una hoja de cálculo de Google Sheets y las muestra en tabla.
async function mostrarTablaContraseñas() {
  const input = document.getElementById('spreadsheetIdInput');
  const spreadsheetId = input.value.trim();

  // Valida formato del ID para evitar errores en la consulta.
  const regex = /^[a-zA-Z0-9-_]{8,64}$/;

  if (spreadsheetId === '') {
    mostrarMensaje('❌ ID vacío. Por favor ingresa un ID.');
    return;
  }

  if (!regex.test(spreadsheetId)) {
    mostrarMensaje('❌ ID inválido o incorrecto (formato).');
    return;
  }

  try {
    // Intenta obtener los datos usando una función externa (asumida).
    const datos = await obtenerContraseñasDesdeSheets(spreadsheetId);

    if (!Array.isArray(datos) || datos.length === 0) {
      mostrarMensaje('❌ ID no válido o no hay datos en la hoja.');
      return;
    }

    mostrarMensaje('✅ ID cargado correctamente. Contraseñas obtenidas.');

    const tabla = document.getElementById('tablaContraseñas');
    tabla.innerHTML = ''; // Limpia la tabla previa.

    datos.forEach((fila, index) => {
      const [n, longitud, expira, contrasena, palabraClave] = fila;
    
      const tr = document.createElement('tr');
    
      const tdN = document.createElement('td');
      tdN.textContent = n;
    
      const tdLongitud = document.createElement('td');
      tdLongitud.textContent = longitud;
    
      const tdExpira = document.createElement('td');
      tdExpira.textContent = expira;
    
      const tdPalabraClave = document.createElement('td');
      tdPalabraClave.textContent = palabraClave;
    
      const tdBoton = document.createElement('td');
      const boton = document.createElement('button');
      boton.textContent = '🔓 Ver';
      boton.onclick = () => mostrarContrasenaGuardada(contrasena);
      tdBoton.appendChild(boton);
    
      tr.appendChild(tdN);
      tr.appendChild(tdLongitud);
      tr.appendChild(tdExpira);
      tr.appendChild(tdPalabraClave);
      tr.appendChild(tdBoton);
    
      tabla.appendChild(tr);
    });

    document.getElementById('tablaContraseñas').addEventListener('click', function (e) {
      if (e.target.classList.contains('ver-btn')) {
        const contrasenaCodificada = e.target.getAttribute('data-contrasena');
        const contrasena = decodeURIComponent(contrasenaCodificada);
        descifrarDesdeTabla(contrasena);
      }
    });
    window.tablaCargada = true; // Marca que la tabla fue cargada correctamente.
  } catch (e) {
    console.error(e);
    mostrarMensaje('❌ Error al obtener las contraseñas. Verifica el ID, la API o la conexión.');
  }
}

function mostrarModalInput({ titulo = 'Ingresar dato', mensaje = '', placeholder = '', aceptarTexto = 'Aceptar', cancelarTexto = 'Cancelar' }) {
  return new Promise((resolve) => {
    // Crea el fondo oscuro
    const fondo = document.createElement('div');
    fondo.className = 'modal-fondo';

    // Crea el modal
    const modal = document.createElement('div');
    modal.className = 'modal-contenedor';
    modal.innerHTML = `
      <h3>${titulo}</h3>
      <p>${mensaje}</p>
      <input type="text" class="modal-input" placeholder="${placeholder}" />
      <div class="modal-botones">
        <button class="modal-aceptar">${aceptarTexto}</button>
        <button class="modal-cancelar">${cancelarTexto}</button>
      </div>
    `;

    fondo.appendChild(modal);
    document.body.appendChild(fondo);

    const input = modal.querySelector('.modal-input');
    input.focus();

    // Cerrar con aceptar
    modal.querySelector('.modal-aceptar').addEventListener('click', () => {
      const valor = input.value.trim();
      document.body.removeChild(fondo);
      resolve(valor || null);
    });

    // Cerrar con cancelar
    modal.querySelector('.modal-cancelar').addEventListener('click', () => {
      document.body.removeChild(fondo);
      resolve(null);
    });

    // Cerrar con ESC
    fondo.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.body.removeChild(fondo);
        resolve(null);
      }
    });

    // Activar captura de teclado
    fondo.tabIndex = 0;
    fondo.focus();
  });
}

function mostrarModalConfirmacion({ titulo = 'Confirmación', mensaje = '', textoBotonConfirmar = 'Aceptar', textoBotonCancelar = 'Cancelar' }) {
  return new Promise((resolve) => {
    const fondo = document.createElement('div');
    fondo.className = 'modal-fondo';

    const modal = document.createElement('div');
    modal.className = 'modal-contenedor';
    modal.innerHTML = `
      <h3>${titulo}</h3>
      <p>${mensaje}</p>
      <div class="modal-botones">
        <button class="modal-aceptar">${textoBotonConfirmar}</button>
        <button class="modal-cancelar">${textoBotonCancelar}</button>
      </div>
    `;

    fondo.appendChild(modal);
    document.body.appendChild(fondo);

    // Botón confirmar
    modal.querySelector('.modal-aceptar').addEventListener('click', () => {
      document.body.removeChild(fondo);
      resolve(true);
    });

    // Botón cancelar
    modal.querySelector('.modal-cancelar').addEventListener('click', () => {
      document.body.removeChild(fondo);
      resolve(false);
    });

    // Cerrar con ESC
    fondo.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.body.removeChild(fondo);
        resolve(false);
      }
    });

    fondo.tabIndex = 0;
    fondo.focus();
  });
}