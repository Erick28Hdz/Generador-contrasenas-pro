// Documento de descubrimiento para Google Sheets API v4
const DISCOVERY_DOC = 'https://sheets.googleapis.com/$discovery/rest?version=v4';

// Alcances (scopes) de permisos necesarios para acceder a Google Sheets
const SCOPES = 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file';


// Variables de control de estado
let tokenClient;
let gapiInited = false;
let gisInited = false;
const CLIENT_ID = '481398224733-ui5jk0ke8bd303aaq1muml9ndn77ouka.apps.googleusercontent.com';
let API_KEY = '';

// Ocultar botones de autorizar y cerrar sesión al cargar la página
document.getElementById('authorize_button').style.visibility = 'hidden';
document.getElementById('signout_button').style.visibility = 'hidden';

// Llama al backend para obtener el clientId de Google
async function obtenerGoogleClientId() {
    try {
        const response = await fetch('https://generador-contrasenas-pro.onrender.com/api/google-config');
        const data = await response.json();
        API_KEY = data.apiKey; // Asigna el clientId desde la respuesta del backend
        console.log("API_KEY:", API_KEY);

        if (API_KEY) {

            tokenClient = google.accounts.oauth2.initTokenClient({
                apiKey: API_KEY,  // Ya tiene el clientId desde el backend
                scope: SCOPES,
                callback: '', // Definir el callback cuando se haga login
            });

            gisInited = true;
            maybeEnableButtons(); // Verifica si se pueden habilitar los botones
        } else {
            console.error("❌ No se pudo obtener el clientId correctamente");
        }
    } catch (err) {
        console.error('❌ Error al obtener el clientId de Google:', err);
    }
}

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

function limpiarCamposInterfaz() {
    // Limpia inputs
    document.getElementById('spreadsheetIdInput').value = '';
    document.getElementById('length').value = '16';
    document.getElementById('result').innerText = '';

    // Limpia mensajes
    document.getElementById('mensajePeriodoPrueba').innerText = '';
    // ✅ Solo limpia el mensaje si el usuario está autenticado
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
        document.getElementById('mensajeBloqueo').innerText = '';
    }

    // Limpia tabla (si tienes una con id="tablaContraseñas" o similar)
    const tabla = document.getElementById('tablaContraseñas');
    if (tabla) {
        tabla.innerHTML = '';
    }

    // Resetea select expTime a su opción por defecto (primer opción)
    const expTimeSelect = document.getElementById('expTime');
    if (expTimeSelect) {
        expTimeSelect.selectedIndex = 0;
    }

    // Desmarca todos los checkboxes
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });

    // Limpia el timer (tiempo de expiración)
    const timerElement = document.getElementById('timer');
    if (timerElement) {
        timerElement.innerText = '';
    }
    limpiarCuentaRegresiva();

    // Limpia bandera de tabla cargada
    window.tablaCargada = false;

    // Limpia otros campos o estados si necesitas
    passwordAlreadySaved = false;
}

// Función para obtener la información del usuario autenticado (como el email)
async function obtenerEmail() {
    const token = gapi.client.getToken();

    if (!token) {
        console.log("No hay token de acceso disponible");
        return null;
    }

    try {
        const response = await fetch('https://people.googleapis.com/v1/people/me?personFields=emailAddresses,names', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token.access_token}`,
            }
        });

        if (!response.ok) {
            throw new Error('Error al obtener los datos del perfil');
        }

        const data = await response.json();

        const email = data.emailAddresses && data.emailAddresses.length > 0 ? data.emailAddresses[0].value : null;
        const name = data.names && data.names.length > 0 ? data.names[0].displayName : null;

        if (email && name) {
            console.log("Email del usuario:", email);
            console.log("Nombre del usuario:", name);

            return { email, name }; // ✅ ¡Aquí retornas el objeto!
        } else {
            console.log("No se pudo encontrar el email o nombre del usuario");
            return null;
        }
    } catch (error) {
        console.error('Error al obtener el email:', error);
        return null;
    }
}


// Maneja el clic en el botón de inicio de sesión
function handleAuthClick() {
    tokenClient.callback = async (resp) => {
        if (resp.error !== undefined) {
            throw (resp);
        }

        // Guarda el access_token en localStorage
        localStorage.setItem('authToken', resp.access_token);

        document.getElementById('signout_button').style.visibility = 'visible';
        document.getElementById('authorize_button').style.visibility = 'hidden';

        verificarAutenticacion();

        const userInfo = await obtenerEmail();
        if (!userInfo) {
            console.error('No se pudieron obtener los datos del usuario.');
            return;
        }

        const { email, name } = userInfo; // ✅ Guarda nombre para usar luego

        try {
            // 1. Verifica si ya existe un usuario
            const checkUser = await fetch(`https://generador-contrasenas-pro.onrender.com/api/membresia/${encodeURIComponent(email)}`);

            if (checkUser.status === 404) {
                // 1. Crear usuario nuevo en el backend
                const createUser = await fetch('https://generador-contrasenas-pro.onrender.com/api/membresia/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        correo: email,
                        name: name,
                        plan: 'prueba'
                    }),
                });

                const result = await createUser.json();
                console.log('👤 Usuario creado:', result);

                // 2. Crear automáticamente su Google Sheet con encabezados
                try {
                    const newSheetId = await createSpreadsheetAndHeaders();
                    console.log('📄 Spreadsheet creado automáticamente para el usuario:', newSheetId);

                    // Guarda el ID del archivo en localStorage (opcional, si lo usas luego)
                    localStorage.setItem('spreadsheetId', newSheetId);

                } catch (sheetError) {
                    console.error('❌ Error al crear spreadsheet para el nuevo usuario:', sheetError);
                }

            } else {
                console.log('👤 Usuario ya existe. No se crea de nuevo.');
            }

            await obtenerEstadoUsuarioDesdeServidor();

        } catch (error) {
            console.error('Error al verificar o crear el usuario:', error);
        }
    };

    if (gapi.client.getToken() === null) {
        tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
        tokenClient.requestAccessToken({ prompt: '' });
    }

    limpiarCamposInterfaz();
}

async function obtenerEstadoUsuarioDesdeServidor() {
    const userInfo = await obtenerEmail();
    if (!userInfo) {
        console.error('No se pudo obtener la información del usuario.');
        return;
    }

    const { email, name } = userInfo;

    try {
        const response = await fetch('https://generador-contrasenas-pro.onrender.com/api/estadoUsuario', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ correo: email }),
        });

        if (!response.ok) throw new Error('No se pudo obtener el estado del usuario');

        const { estado, plan, finPremium } = await response.json();

        const esPremium = estado === "premium";
        localStorage.setItem("nombreUsuario", name);
        localStorage.setItem("correo", email);
        localStorage.setItem("planPremium", esPremium ? "premium" : "prueba");
        localStorage.setItem("nombrePlan", plan);
        localStorage.setItem("finPremium", finPremium);

        const fechaFin = new Date(finPremium).toLocaleDateString('es-ES', {
            year: 'numeric', month: 'long', day: 'numeric'
        });

        document.getElementById('mensajePeriodoPrueba').innerText =
            `Hola ${name}, tu plan "${plan}" expira el ${fechaFin}`;

        const botonPremium = document.getElementById("botonPremium");
        if (esPremium && botonPremium) botonPremium.style.display = "none";

        mostrarTiempoRestante();

    } catch (error) {
        console.error('Error al obtener el estado del usuario:', error);
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

    localStorage.removeItem("nombreUsuario");
    // Eliminar el token de localStorage
    localStorage.removeItem('authToken');

    // Vuelve a verificar el estado de autenticación para ajustar la interfaz
    verificarAutenticacion();
    limpiarCamposInterfaz();
    mostrarMensaje("¡Has cerrado sesión correctamente!");
}

// ✅ Verifica si el usuario está autenticado actualmente
function usuarioAutenticado() {
    // Obtiene el token actual de Google
    const token = gapi.client.getToken();

    // Devuelve true si el token existe (usuario autenticado), o false si no
    return token !== null;
}

// ✅ Verifica si hay un token válido almacenado y ajusta la interfaz
function desbloquearContenido() {
    document.getElementById('contenidoApp').style.display = 'block';
}