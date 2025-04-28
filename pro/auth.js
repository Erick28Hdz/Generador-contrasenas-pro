// Importación de módulos necesarios desde Firebase versión 9 modular
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// Configuración del proyecto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCT_qP7Cn4NZhrpzxTNkJfORQdxvCsy4CI",
  authDomain: "generador-f7f23.firebaseapp.com",
  projectId: "generador-f7f23",
  storageBucket: "generador-f7f23.firebasestorage.app",
  messagingSenderId: "311864485931",
  appId: "1:311864485931:web:c5e85328f5e5c684fc626e",
  measurementId: "G-YW358XZY7C",
};

// Inicializa Firebase con la configuración
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Configuración de Google Auth
const googleProvider = new GoogleAuthProvider();

// Agregar los scopes necesarios
googleProvider.addScope('https://www.googleapis.com/auth/drive.file');
googleProvider.addScope('https://www.googleapis.com/auth/spreadsheets');

// Función para iniciar sesión con Google
function iniciarSesionConGoogle() {
  signInWithPopup(auth, googleProvider)
    .then((result) => {
      const user = result.user;
      console.log("✅ Usuario autenticado:", user.displayName, user.email);

      // 🟢 Guardar el accessToken además del email y nombre
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const accessToken = credential.accessToken;
      localStorage.setItem('accessToken', accessToken);

      // Guardar información básica del usuario
      localStorage.setItem("usuarioRegistrado", "true");
      localStorage.setItem("usuarioEmail", user.email);
      localStorage.setItem("usuarioNombre", user.displayName);

      // 🟢 Crear fecha de inicio de prueba si es la primera vez
      if (!localStorage.getItem("inicioPrueba")) {
        const hoy = new Date().toISOString();
        localStorage.setItem("inicioPrueba", hoy);
      }

      // ✅ Mostrar contenido autorizado y actualizar mensajes
      mostrarContenidoSiAutenticado();
      mostrarTiempoRestante();

      // 🔒 Ocultar botón de login si ya inició sesión
      const botonLogin = document.getElementById("loginGoogle");
      if (botonLogin) botonLogin.style.display = "none";

      alert(`¡Bienvenido ${user.displayName}!`);
    })
    .catch((error) => {
      console.error("❌ Error en login:", error.message);
      alert("Error al iniciar sesión con Google");
    });
}

function inicializarGapiConAccessToken(accessToken) {
  gapi.load('client:auth2', () => {
    gapi.client.init({
      apiKey: '', // si es necesario
      discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
    }).then(() => {
      gapi.client.setToken({ access_token: accessToken });
      console.log("✅ GAPI inicializado con accessToken");

      // Ahora puedes hacer llamadas a la API de Drive
      crearHojaDeCalculoParaUsuario(); // Asegúrate de llamar la función aquí, después de la inicialización
    }).catch((error) => {
      console.error("❌ Error al inicializar GAPI:", error);
    });
  });
}
// Espera a que el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  const botonGoogle = document.getElementById("loginGoogle");

  if (botonGoogle) {
    botonGoogle.addEventListener("click", iniciarSesionConGoogle);
  }

  // Solo muestra mensaje en consola si hay sesión activa
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log(`👤 Sesión activa: ${user.displayName} (${user.email})`);
    } else {
      console.log("🔒 No hay usuario autenticado");
    }
  });
});
