let cuentaRegresivaInterval; // Variable global para manejar el intervalo de cuenta regresiva

// Función principal para generar la contraseña
function generatePassword() {
  // Obtener valores de los elementos del formulario
  const length = parseInt(document.getElementById('length').value);
  const useUpper = document.getElementById('uppercase').checked;
  const useLower = document.getElementById('lowercase').checked;
  const useNumbers = document.getElementById('numbers').checked;
  const useSymbols = document.getElementById('symbols').checked;
  const noAmbiguous = document.getElementById('no-ambiguous').checked;

  // Validar longitud
  if (isNaN(length) || length <= 0) {
    alert("Ingresa una longitud válida mayor a cero.");
    return;
  }

  // Validar tiempo de expiración
  const expirationMinutes = parseInt(document.getElementById('expTime').value);
  if (isNaN(expirationMinutes) || expirationMinutes < 0) {
    alert("Ingresa un tiempo de expiración válido (0 o mayor).");
    return;
  }

  // Caracteres disponibles para generar la contraseña
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*()_-+[]{}<>?";
  const ambiguous = "O0Il1"; // Caracteres ambiguos que pueden confundirse

  let chars = ""; // Variable que contendrá todos los caracteres permitidos

  // Construir el conjunto de caracteres según opciones seleccionadas
  if (useUpper) chars += upper;
  if (useLower) chars += lower;
  if (useNumbers) chars += numbers;
  if (useSymbols) chars += symbols;

  // Eliminar caracteres ambiguos si se seleccionó esa opción
  if (noAmbiguous) {
    chars = chars.split('').filter(c => !ambiguous.includes(c)).join('');
  }

  // Validar que se haya seleccionado al menos un tipo de carácter
  if (chars.length === 0) {
    alert("Selecciona al menos un tipo de carácter.");
    return;
  }

  // Generar la contraseña aleatoria
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  // Mostrar la contraseña generada
  const resultEl = document.getElementById('result');
  resultEl.innerText = password;
  resultEl.classList.remove("expired"); // Quitar estilo de expiración si existía

  // Mostrar u ocultar la contraseña según opción seleccionada
  const showPassword = document.getElementById('togglePassword').checked;
  resultEl.style.filter = showPassword ? 'none' : 'blur(5px)';

  // Guardar contraseña en localStorage si tiene tiempo de expiración
  if (expirationMinutes > 0) {
    const expirationTime = new Date(new Date().getTime() + expirationMinutes * 60000); // Tiempo de expiración en ms
    savePasswordWithExpiration(password, expirationTime); // Guardar en localStorage
    iniciarCuentaRegresiva(expirationTime); // Iniciar cuenta regresiva
  } else {
    // Si no hay expiración, limpiar temporizador
    document.getElementById('timer').innerText = '';
    limpiarCuentaRegresiva();
  }
}

// Guarda la contraseña y su tiempo de expiración en localStorage
function savePasswordWithExpiration(password, expirationTime) {
  let passwordsList = JSON.parse(localStorage.getItem("passwordList")) || [];
  passwordsList.push({ password, expirationTime });
  localStorage.setItem("passwordList", JSON.stringify(passwordsList));
}

// Inicia un temporizador en pantalla que muestra el tiempo restante
function iniciarCuentaRegresiva(expiracion) {
  limpiarCuentaRegresiva(); // Limpiar cualquier temporizador previo

  cuentaRegresivaInterval = setInterval(() => {
    const ahora = new Date();
    const tiempoRestante = expiracion - ahora;

    if (tiempoRestante <= 0) {
      // Si expiró, detener temporizador y mostrar advertencia
      clearInterval(cuentaRegresivaInterval);
      const resultEl = document.getElementById('result');
      resultEl.innerText = "⚠️ Contraseña expirada.";
      resultEl.classList.add("expired");
      document.getElementById('timer').innerText = "";
      localStorage.removeItem("passwordList"); // Eliminar de almacenamiento
    } else {
      // Calcular días, horas, minutos y segundos restantes
      const dias = Math.floor(tiempoRestante / (1000 * 60 * 60 * 24));
      const horas = Math.floor((tiempoRestante % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutos = Math.floor((tiempoRestante % (1000 * 60 * 60)) / (1000 * 60));
      const segundos = Math.floor((tiempoRestante % (1000 * 60)) / 1000);

      // Mostrar temporizador en pantalla
      document.getElementById('timer').innerText =
        `⏳ Expira en ${dias}d ${horas}h ${minutos}m ${segundos}s`;
    }
  }, 1000); // Actualiza cada segundo
}

// Detiene el temporizador actual si existe
function limpiarCuentaRegresiva() {
  clearInterval(cuentaRegresivaInterval);
}

// Copia la contraseña visible al portapapeles
function copyToClipboard() {
  const password = document.getElementById('result').innerText;
  if (password && password !== "⚠️ Contraseña expirada.") {
    navigator.clipboard.writeText(password).then(() => {
      alert("¡Contraseña copiada al portapapeles!");
    });
  } else {
    alert("No hay contraseña válida para copiar.");
  }
}

// Limpia el almacenamiento y la pantalla
function clearPasswords() {
  localStorage.removeItem("passwordList");
  document.getElementById('result').innerText = '';
  document.getElementById('timer').innerText = '';
  limpiarCuentaRegresiva();
  alert("Contraseñas eliminadas.");
}

// Revisa y elimina contraseñas expiradas del localStorage
function checkExpiration() {
  let passwordsList = JSON.parse(localStorage.getItem("passwordList")) || [];
  const now = new Date();

  passwordsList = passwordsList.filter(entry => {
    const expirationDate = new Date(entry.expirationTime);
    if (now > expirationDate) {
      console.log(`La contraseña ${entry.password} ha expirado y se eliminó.`);
      return false; // Eliminar contraseña expirada
    }
    return true; // Conservar las vigentes
  });

  localStorage.setItem("passwordList", JSON.stringify(passwordsList));
  console.log("Contraseñas activas:", passwordsList);
}

// Muestra u oculta la contraseña en pantalla según el checkbox
function togglePasswordVisibility() {
  const el = document.getElementById('result');
  el.style.filter = document.getElementById('togglePassword').checked ? 'none' : 'blur(5px)';
}
