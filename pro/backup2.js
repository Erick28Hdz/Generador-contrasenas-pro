// backup.js

// ✅ Inicializar el cliente de Google (nuevo sistema)
google.accounts.id.initialize({
    client_id: '753138078000-57bk6n6sd2f62oemidl3rmuokgntloct.apps.googleusercontent.com',
    callback: handleCredentialResponse
});

// ✅ Dibujar el botón de login de Google en un div
google.accounts.id.renderButton(
    document.getElementById('guardarContraseña'),
    { theme: "outline", size: "large" }
);

// ✅ Configurar el cliente de la API de Google con tus credenciales y permisos
function initClient() {
    gapi.client.init({
        apiKey: 'AIzaSyCaE-jca1N5lxx7Uh1H7f3F6xTpUBV_vjQ',
        clientId: '753138078000-57bk6n6sd2f62oemidl3rmuokgntloct.apps.googleusercontent.com',
        discoveryDocs: [
            'https://sheets.googleapis.com/$discovery/rest?version=v4',
            'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
        ],
        scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file'
    }).then(function () {
        gapi.auth2.init().then(() => {
            console.log('🔐 auth2 inicializado correctamente');
            gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
            updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        }).catch(error => {
            console.error('❌ Error al inicializar auth2', error);
        });
    }).catch(error => {
        console.error('❌ Error al inicializar gapi.client', error);
    });
}

// ✅ Actualiza el comportamiento según si el usuario está autenticado o no
function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        console.log('✅ Usuario autenticado');
    } else {
        console.log('❌ Usuario no autenticado');
        gapi.auth2.getAuthInstance().signIn();
    }
}

// ✅ Función que autentica al usuario y luego guarda los datos automáticamente
function autenticarGoogle() {
    const authInstance = gapi.auth2.getAuthInstance();
    if (authInstance.isSignedIn.get()) {
        console.log('✅ Ya estás autenticado en Google');
        guardarEnGoogleDrive();
    } else {
        console.log('🔄 No estás autenticado en gapi, autenticando...');
        authInstance.signIn().then(() => {
            console.log('✅ Autenticación exitosa');
            guardarEnGoogleDrive();
        }).catch((error) => {
            console.error('❌ Error al autenticar', error);
        });
    }
}

// ✅ Función para guardar datos en Google Sheets
function guardarEnGoogleSheets() {
    const sheetId = 'TU_ID_DE_HOJA_DE_CALCULO'; 
    const range = 'Hoja1!A1'; 

    const valores = [
        ["Contraseña", "Fecha de Creación", "Fecha de Expiración"]
    ];

    const body = {
        values: valores
    };

    const request = gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: range,
        valueInputOption: 'RAW',
        resource: body
    });

    request.then((response) => {
        console.log('📊 Datos guardados en Sheets:', response);
    }, (error) => {
        console.log('❌ Error al guardar en Sheets:', error);
    });
}

// ✅ Función para guardar archivo en Google Drive
function guardarEnGoogleDrive() {
    const fileMetadata = {
        'name': 'contraseña.txt',
        'mimeType': 'text/plain'
    };

    const media = {
        mimeType: 'text/plain',
        body: 'Contraseña Guardada'
    };

    const request = gapi.client.drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id'
    });

    request.then((response) => {
        console.log('📁 Archivo guardado en Drive con ID:', response.result.id);
    }, (error) => {
        console.log('❌ Error al guardar en Drive:', error);
    });
}

// ✅ Asociar botón al proceso de autenticación y guardado
document.getElementById('guardarContraseña').addEventListener('click', autenticarGoogle);

// 🚀 INICIALIZAR la API de Google automáticamente al cargar el script
initGoogleAPI();
