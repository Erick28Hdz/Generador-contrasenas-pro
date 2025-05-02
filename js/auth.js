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

// Maneja el clic en el botón de cerrar sesión
function handleSignoutClick() {
    const token = gapi.client.getToken();
    if (token !== null) {
        google.accounts.oauth2.revoke(token.access_token); // Revoca el token en Google
        gapi.client.setToken('');                         // Limpia el token en gapi
        localStorage.removeItem('authToken');            // Elimina el token guardado
        localStorage.removeItem('spreadsheetId');       // Elimina el ID del spreadsheet guardado
    }

    document.getElementById('content').innerText = '';                   // Limpia contenido mostrado
    document.getElementById('authorize_button').style.visibility = 'visible'; // Muestra botón autorizar
    document.getElementById('signout_button').style.visibility = 'hidden';    // Oculta botón cerrar sesión

    // Limpia mensajes relacionados al periodo de prueba o bloqueo
    document.getElementById('mensajePeriodoPrueba').innerText = '';
    document.getElementById('mensajeBloqueo').innerText = '';

    // Verifica autenticación para actualizar la interfaz
    verificarAutenticacion();
}

// Ejecuta al cargar la ventana
window.onload = () => {
    verificarAutenticacion();   // Verifica si el usuario está autenticado
    mostrarTiempoRestante();    // Muestra tiempo restante de sesión o periodo de prueba
};

// Verifica si el usuario tiene un token válido almacenado
function verificarAutenticacion() {
    const token = localStorage.getItem('authToken'); // Recupera el token

    if (token) {
        desbloquearContenido();      // Desbloquea contenido si está autenticado
        mostrarTiempoRestante();     // Actualiza el estado del periodo de prueba
    } else {
        bloquearContenido();         // Bloquea contenido si no hay autenticación
    }
}
