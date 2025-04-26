// backup.js

// ✅ Inicializar la API de Google cuando se cargue el script
function initGoogleAPI() {
    gapi.load('client:auth2', initClient); // Carga los módulos necesarios: cliente y autenticación OAuth
}

// ✅ Configurar el cliente de la API de Google con tus credenciales y permisos
function initClient() {
    gapi.client.init({
        apiKey: 'TU_API_KEY', // 🔐 Reemplaza esto con tu propia API Key
        clientId: 'TU_CLIENT_ID', // 🔐 Reemplaza esto con tu propio ID de cliente OAuth 2.0
        discoveryDocs: [
            'https://sheets.googleapis.com/$discovery/rest?version=v4', // 📄 API de Google Sheets
            'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest' // 🗂️ API de Google Drive
        ],
        scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file' // 🔑 Permisos necesarios: acceso a hojas de cálculo y archivos en Drive
    }).then(function () {
        // ⏳ Escucha los cambios en el estado de autenticación del usuario
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

        // 📌 Verifica el estado actual de autenticación
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    });
}

// ✅ Actualiza el comportamiento según si el usuario está autenticado o no
function updateSigninStatus(isSignedIn) {
    if (isSignedIn) {
        console.log('✅ Usuario autenticado');
        // 👉 Aquí puedes invocar funciones como guardarEnGoogleSheets() o guardarEnGoogleDrive()
    } else {
        console.log('❌ Usuario no autenticado');
        // 🔄 Solicita que el usuario inicie sesión con su cuenta de Google
        gapi.auth2.getAuthInstance().signIn();
    }
}

// ✅ Función que autentica al usuario y luego guarda los datos automáticamente
function autenticarGoogle() {
    gapi.auth2.getAuthInstance().signIn().then(() => {
        console.log('✅ Autenticación exitosa');
        guardarEnGoogleSheets(); // 📤 Llama a la función para guardar datos en Google Sheets
    }).catch((error) => {
        console.log('❌ Error al autenticar', error);
    });
}

// ✅ Función para guardar datos (por ejemplo, contraseñas) en una hoja de Google Sheets
function guardarEnGoogleSheets() {
    const sheetId = 'TU_ID_DE_HOJA_DE_CALCULO'; // 📄 ID de tu hoja de cálculo de Google
    const range = 'Hoja1!A1'; // 📌 Celda o rango donde se guardarán los datos

    // 📝 Datos que se van a insertar en la hoja
    const valores = [
        ["Contraseña", "Fecha de Creación", "Fecha de Expiración"]
    ];

    // 🔧 Cuerpo de la petición con los datos
    const body = {
        values: valores
    };

    // 📡 Solicitud a la API de Sheets para actualizar los datos
    const request = gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: range,
        valueInputOption: 'RAW', // RAW = insertar los valores tal como se escriben
        resource: body
    });

    // 📬 Manejo de la respuesta
    request.then((response) => {
        console.log('📊 Datos guardados en Sheets:', response);
    }, (error) => {
        console.log('❌ Error al guardar en Sheets:', error);
    });
}

// ✅ Función para guardar un archivo de texto (por ejemplo, una contraseña) en Google Drive
function guardarEnGoogleDrive() {
    // 🧾 Metadatos del archivo a guardar
    const fileMetadata = {
        'name': 'contraseña.txt', // 📝 Nombre del archivo que se guardará en Drive
        'mimeType': 'text/plain' // 📄 Tipo MIME del archivo
    };

    // 📦 Contenido del archivo
    const media = {
        mimeType: 'text/plain',
        body: 'Contraseña Guardada' // Aquí podrías poner una contraseña dinámica u otro dato
    };

    // 📡 Solicitud para crear el archivo en Drive
    const request = gapi.client.drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id' // Solo se solicita el ID del archivo creado
    });

    // 📬 Manejo de la respuesta
    request.then((response) => {
        console.log('📁 Archivo guardado en Drive con ID:', response.result.id);
    }, (error) => {
        console.log('❌ Error al guardar en Drive:', error);
    });
}

// ✅ Asociar el botón con ID 'guardarContraseña' al proceso de autenticación y guardado
document.getElementById('guardarContraseña').addEventListener('click', autenticarGoogle);
