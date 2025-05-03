// ID de cliente de Google (OAuth 2.0)
const CLIENT_ID = '481398224733-ui5jk0ke8bd303aaq1muml9ndn77ouka.apps.googleusercontent.com';

// Clave de API para acceder a los servicios de Google
const API_KEY = 'AIzaSyBCYaZfbQqP4QkS1HnwGEMwc-5J6pNG0kI';

// Documento de descubrimiento para Google Sheets API v4
const DISCOVERY_DOC = 'https://sheets.googleapis.com/$discovery/rest?version=v4';

// Alcances (scopes) de permisos necesarios para acceder a Google Sheets
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';

// Variables de control de estado
let tokenClient;   // Cliente de token de Google Identity Services
let gapiInited = false; // Bandera: indica si gapi fue inicializado
let gisInited = false;  // Bandera: indica si GIS fue inicializado

// Ocultar botones de autorizar y cerrar sesión al cargar la página
document.getElementById('authorize_button').style.visibility = 'hidden';
document.getElementById('signout_button').style.visibility = 'hidden';

// Función llamada cuando se carga la librería gapi
function gapiLoaded() {
    gapi.load('client', initializeGapiClient); // Carga el cliente gapi
}

// Inicializa el cliente GAPI con la API key y discovery doc
async function initializeGapiClient() {
    await gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: [DISCOVERY_DOC],
    });
    gapiInited = true;         // Marca que gapi está listo
    maybeEnableButtons();      // Verifica si ya se pueden activar los botones
}

// Inicializa el cliente Google Identity Services (GIS)
function gisLoaded() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: '', // El callback se definirá al hacer login
    });
    gisInited = true;          // Marca que GIS está listo
    maybeEnableButtons();      // Verifica si ya se pueden activar los botones
}

// Habilita los botones si tanto gapi como GIS ya están listos
function maybeEnableButtons() {
    if (gapiInited && gisInited) {
        const storedToken = localStorage.getItem('authToken'); // Recupera el token guardado
        if (storedToken) {
            gapi.client.setToken({ access_token: storedToken }); // Establece el token en gapi

            document.getElementById('signout_button').style.visibility = 'visible';  // Mostrar botón cerrar sesión
            document.getElementById('authorize_button').style.visibility = 'hidden'; // Ocultar botón autorizar

            // Verificar si existe un spreadsheet guardado (opcional, según tu app)
            if (typeof checkIfSpreadsheetExists === 'function') {
                checkIfSpreadsheetExists();
            }
        } else {
            document.getElementById('authorize_button').style.visibility = 'visible'; // Mostrar botón autorizar
            document.getElementById('signout_button').style.visibility = 'hidden';    // Ocultar botón cerrar sesión
        }
    }
}

// Maneja el clic en el botón de autorización
function handleAuthClick() {
    // 🔥 Limpia localStorage antes de iniciar sesión
    localStorage.clear();

    tokenClient.callback = async (resp) => {
        if (resp.error !== undefined) {
            throw (resp); // Lanza error si hay un problema
        }

        // Guarda el access_token en localStorage
        localStorage.setItem('authToken', resp.access_token);

        document.getElementById('signout_button').style.visibility = 'visible';  // Mostrar botón cerrar sesión
        document.getElementById('authorize_button').style.visibility = 'hidden'; // Ocultar botón autorizar

        // Desbloquear el contenido protegido de la app
        desbloquearContenido();
    };

    if (gapi.client.getToken() === null) {
        tokenClient.requestAccessToken({ prompt: 'consent' }); // Solicitar token con consentimiento
    } else {
        tokenClient.requestAccessToken({ prompt: '' }); // Solicitar token sin volver a pedir consentimiento
    }
}

// ✅ Maneja el clic en el botón de cerrar sesión
function handleSignoutClick() {
    // Obtiene el token actual de sesión
    const token = gapi.client.getToken();

    // Si existe un token, lo revoca (cierra sesión en Google)
    if (token !== null) {
        google.accounts.oauth2.revoke(token.access_token);
        gapi.client.setToken('');  // Limpia el token localmente
    }

    // Limpia el contenido mostrado en la interfaz
    document.getElementById('content').innerText = '';
    document.getElementById('authorize_button').style.visibility = 'visible'; // Muestra botón de iniciar sesión
    document.getElementById('signout_button').style.visibility = 'hidden';   // Oculta botón de cerrar sesión
    document.getElementById('mensajePeriodoPrueba').innerText = '';           // Limpia mensaje de periodo de prueba
    document.getElementById('mensajeBloqueo').innerText = '';                 // Limpia mensaje de bloqueo
    
    // Vuelve a verificar el estado de autenticación para ajustar la interfaz
    verificarAutenticacion();
}

// ✅ Verifica si el usuario está autenticado actualmente
function usuarioAutenticado() {
    // Obtiene el token actual de Google
    const token = gapi.client.getToken();

    // Devuelve true si el token existe (usuario autenticado), o false si no
    return token !== null;
}

// ✅ Verifica si hay un token válido almacenado y ajusta la interfaz
function verificarAutenticacion() {
    // Obtiene el token actual de Google
    const token = gapi.client.getToken();

    if (token) {
        // Si hay token, desbloquea el contenido restringido
        desbloquearContenido();

        // Muestra el tiempo restante de la sesión o del periodo de prueba
        mostrarTiempoRestante();
    } else {
        // Si no hay token, bloquea el contenido restringido
        bloquearContenido();
    }
}