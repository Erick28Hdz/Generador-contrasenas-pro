// ✅ Activar o desactivar el cifrado con el checkbox
function toggleCifrado() {
    const checkbox = document.getElementById("togglePassword");
    window.cifradoActivado = checkbox.checked; 
}

// ✅ Objeto que contiene todas las funciones de cifrado y descifrado
const cifrado = {
    /**
     * ✅ Deriva una clave segura usando PBKDF2.
     * @param {string} passphrase - La contraseña base introducida por el usuario.
     * @param {string | Uint8Array} salt - El salt (aleatorio) para fortalecer la clave.
     * @returns {CryptoKey} - Clave derivada lista para cifrar/descifrar.
     */
    async derivarClave(passphrase, salt) {
        const encoder = new TextEncoder();
        const keyMaterial = await window.crypto.subtle.importKey(
            "raw",
            encoder.encode(passphrase),
            "PBKDF2",
            false,
            ["deriveKey"]
        );

        return window.crypto.subtle.deriveKey(
            {
                name: "PBKDF2",
                salt: encoder.encode(salt),
                iterations: 100000,
                hash: "SHA-256"
            },
            keyMaterial,
            { name: "AES-GCM", length: 256 },
            false,
            ["encrypt", "decrypt"]
        );
    },

    /**
     * ✅ Cifra un texto plano usando AES-GCM.
     * @param {string} textoPlano - El texto que queremos cifrar.
     * @param {string} claveSecreta - La contraseña para derivar la clave.
     * @returns {string} - Texto cifrado y codificado en Base64 (salt + iv + datos).
     */
    async cifrarTexto(textoPlano, claveSecreta) {
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const clave = await this.derivarClave(claveSecreta, salt);
        const encoder = new TextEncoder();
        const datos = encoder.encode(textoPlano);

        const cifrado = await window.crypto.subtle.encrypt(
            {
                name: "AES-GCM",
                iv: iv
            },
            clave,
            datos
        );

        // Combina salt + iv + datos cifrados y lo codifica en Base64
        const bufferFinal = new Uint8Array([...salt, ...iv, ...new Uint8Array(cifrado)]);
        return btoa(String.fromCharCode(...bufferFinal));
    },

    /**
     * ✅ Descifra un texto cifrado en Base64 usando AES-GCM.
     * @param {string} textoCifradoBase64 - El texto cifrado (salt + iv + datos) en Base64.
     * @param {string} claveSecreta - La contraseña para derivar la clave.
     * @returns {string} - Texto plano descifrado.
     */
    async descifrarTexto(textoCifradoBase64, claveSecreta) {
        const datos = Uint8Array.from(atob(textoCifradoBase64), c => c.charCodeAt(0));
        const salt = datos.slice(0, 16);
        const iv = datos.slice(16, 28);
        const datosCifrados = datos.slice(28);

        const clave = await this.derivarClave(claveSecreta, salt);
        const descifrado = await window.crypto.subtle.decrypt(
            {
                name: "AES-GCM",
                iv: iv
            },
            clave,
            datosCifrados
        );

        const decoder = new TextDecoder();
        return decoder.decode(descifrado);
    }
};

/**
 * ✅ Muestra la contraseña almacenada.
 * Si el cifrado está activado, solicita clave para descifrar; si no, muestra el texto cifrado tal cual.
 * @param {string} textoCifrado - El texto cifrado (o texto plano si no se usó cifrado).
 */
async function mostrarContrasenaGuardada(textoCifrado) {
    if (cifradoActivado) {
        const clave = prompt("🔓 Introduce la clave para descifrar:");
        if (!clave) {
            mostrarMensaje("❌ Clave requerida.");
            return;
        }
        try {
            const descifrada = await cifrado.descifrarTexto(textoCifrado, clave);
            mostrarMensaje(`🔓 Contraseña: ${descifrada}`);
        } catch (err) {
            mostrarMensaje("❌ Clave incorrecta o formato inválido.");
        }
    } else {
        mostrarMensaje(`🔐 Contraseña almacenada: ${textoCifrado}`);
    }
}

// ✅ Configura el checkbox y define el estado inicial del cifrado al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    const checkbox = document.getElementById("togglePassword");
    window.cifradoActivado = checkbox.checked;

    // ✅ Asegura que el checkbox cambie el estado del cifrado global
    checkbox.addEventListener("change", toggleCifrado);
});
