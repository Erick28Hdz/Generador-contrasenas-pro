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
const googleProvider = new GoogleAuthProvider();

// Función para iniciar sesión con Google
function iniciarSesionConGoogle() {
  signInWithPopup(auth, googleProvider)
    .then((result) => {
      const user = result.user;
      console.log("✅ Usuario autenticado:", user.displayName, user.email);

      // Guardar información básica del usuario
      localStorage.setItem("usuarioRegistrado", "true");
      localStorage.setItem("usuarioEmail", user.email);
      localStorage.setItem("usuarioNombre", user.displayName);

      alert(`¡Bienvenido ${user.displayName}!`);
    })
    .catch((error) => {
      console.error("❌ Error en login:", error.message);
      alert("Error al iniciar sesión con Google");
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
