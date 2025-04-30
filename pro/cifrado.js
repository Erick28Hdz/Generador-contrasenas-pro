// Activar o desactivar el cifrado con el checkbox
function toggleCifrado() {
    const checkbox = document.getElementById("togglePassword");
    window.cifradoActivado = checkbox.checked; 
}

const cifrado = {
    // Derivar una clave segura usando PBKDF2
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

    // Cifrar texto plano
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

        // Combinar salt + iv + datos cifrados y codificar en Base64
        const bufferFinal = new Uint8Array([...salt, ...iv, ...new Uint8Array(cifrado)]);
        return btoa(String.fromCharCode(...bufferFinal));
    },

    // Descifrar texto cifrado en base64
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

// Mostrar contraseña (descifrada si aplica)
async function mostrarContrasenaGuardada(textoCifrado) {
    if (cifradoActivado) {
        const clave = prompt("🔓 Introduce la clave para descifrar:");
        if (!clave) {
            alert("❌ Clave requerida.");
            return;
        }
        try {
            const descifrada = await cifrado.descifrarTexto(textoCifrado, clave);
            alert(`🔓 Contraseña: ${descifrada}`);
        } catch (err) {
            alert("❌ Clave incorrecta o formato inválido.");
        }
    } else {
        alert(`🔐 Contraseña almacenada: ${textoCifrado}`);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const checkbox = document.getElementById("togglePassword");
    window.cifradoActivado = checkbox.checked;

    // Asegura que el checkbox cambie el estado
    checkbox.addEventListener("change", toggleCifrado);
});