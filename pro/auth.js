const CLIENT_ID = '481398224733-ui5jk0ke8bd303aaq1muml9ndn77ouka.apps.googleusercontent.com';
const API_KEY = 'AIzaSyBCYaZfbQqP4QkS1HnwGEMwc-5J6pNG0kI';
const DISCOVERY_DOC = 'https://sheets.googleapis.com/$discovery/rest?version=v4';
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';

let tokenClient;
let gapiInited = false;
let gisInited = false;

document.getElementById('authorize_button').style.visibility = 'hidden';
document.getElementById('signout_button').style.visibility = 'hidden';

// Carga de la librería gapi
function gapiLoaded() {
    gapi.load('client', initializeGapiClient);
}

// Inicializa cliente GAPI
async function initializeGapiClient() {
    await gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: [DISCOVERY_DOC],
    });
    gapiInited = true;
    maybeEnableButtons();
}

// Inicializa cliente Google Identity Services
function gisLoaded() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: '', // El callback se configura al hacer login
    });
    gisInited = true;
    maybeEnableButtons();
}

// Habilitar botones si la librería GAPI y el servicio de identidad están listos
function maybeEnableButtons() {
    if (gapiInited && gisInited) {
        const storedToken = localStorage.getItem('authToken');
        if (storedToken) {
            gapi.client.setToken({ access_token: storedToken });

            // Verificar si el token es válido
            gapi.client.sheets.spreadsheets.get({
                spreadsheetId: 'fake_spreadsheet_id_to_test',
            }).then(() => {
                // No debería entrar aquí porque el ID es falso
            }).catch((error) => {
                if (error.status === 401 || error.status === 403) {
                    console.log('Token expirado o inválido. Eliminando...');
                    localStorage.removeItem('authToken');
                }
            });

            document.getElementById('signout_button').style.visibility = 'visible';
            document.getElementById('authorize_button').style.visibility = 'hidden';
            checkIfSpreadsheetExists();
        } else {
            document.getElementById('authorize_button').style.visibility = 'visible';
            document.getElementById('signout_button').style.visibility = 'hidden';
        }
    }
}

// Botón de autorización
function handleAuthClick() {
    tokenClient.callback = async (resp) => {
        if (resp.error !== undefined) {
            throw (resp);
        }

        // Guardar el token en localStorage
        localStorage.setItem('authToken', resp.access_token);

        document.getElementById('signout_button').style.visibility = 'visible';
        document.getElementById('authorize_button').style.visibility = 'hidden';

    };

    if (gapi.client.getToken() === null) {
        tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
        tokenClient.requestAccessToken({ prompt: '' });
    }
}

// Botón de cerrar sesión
function handleSignoutClick() {
    const token = gapi.client.getToken();
    if (token !== null) {
        google.accounts.oauth2.revoke(token.access_token);
        gapi.client.setToken('');
        localStorage.removeItem('authToken');
        localStorage.removeItem('spreadsheetId'); // También limpiar el ID del spreadsheet
    }

    document.getElementById('content').innerText = '';
    document.getElementById('authorize_button').style.visibility = 'visible';
    document.getElementById('signout_button').style.visibility = 'hidden';
}

