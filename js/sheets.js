// Asigna un listener al botón con id 'createSpreadsheet' para detectar clicks
document.getElementById('createSpreadsheet').addEventListener('click', async () => {
    // Obtiene el ID del spreadsheet guardado previamente en localStorage (si existe)
    const existingSpreadsheetId = localStorage.getItem('spreadsheetId');

    // Si ya existe un spreadsheet guardado
    if (existingSpreadsheetId) {
        // Muestra un cuadro de confirmación al usuario para preguntar si quiere crear uno nuevo
        const confirmNew = confirm('⚠️ Ya tienes un archivo creado. ¿Quieres crear uno nuevo?');
        // Si el usuario cancela, muestra mensaje de cancelación y termina la función
        if (!confirmNew) {
            mostrarMensaje('❌ Creación de nuevo archivo cancelada.');
            return;
        }
    }

    try {
        // Llama a la función async que crea el spreadsheet y obtiene su ID
        const spreadsheetId = await createSpreadsheetAndHeaders();
        // Guarda el nuevo ID en localStorage para uso posterior
        localStorage.setItem('spreadsheetId', spreadsheetId);

        // Actualiza el contenido del elemento con id 'content' para mostrar enlace y botón copiar
        document.getElementById('content').innerHTML = `
            <p>📄 Nuevo documento creado:</p>
            <a href="https://docs.google.com/spreadsheets/d/${spreadsheetId}" target="_blank">Ver archivo</a>
            <button onclick="copyFileId('${spreadsheetId}')">📋 Copiar ID</button>
        `;

        // Muestra un mensaje de éxito al usuario
        mostrarMensaje('🚀 ¡Nuevo archivo creado y listo para usar!');
    } catch (err) {
        // Si ocurre un error al crear el archivo, muestra un mensaje de error
        mostrarMensaje('❌ Error al crear el archivo.');
        // También muestra el error en la consola para depuración
        console.error(err);
    }
});

// Función asíncrona para crear un Google Spreadsheet y agregarle encabezados
async function createSpreadsheetAndHeaders() {
    try {
        // Llama a la API de Google Sheets para crear un nuevo spreadsheet con el título especificado
        const response = await gapi.client.sheets.spreadsheets.create({
            properties: { title: "Generador de Contraseñas Pro" }  // Título del spreadsheet
        });

        // Guarda el ID del spreadsheet recién creado desde la respuesta de la API
        const spreadsheetId = response.result.spreadsheetId;

        // ⚠️ Importante: todavía no guardamos el ID en localStorage, solo lo mostramos en consola
        console.log('📄 Spreadsheet creado con ID:', spreadsheetId);

        // Llama a la API de Google Sheets para actualizar el rango A1:E1 con los encabezados
        await gapi.client.sheets.spreadsheets.values.update({
            spreadsheetId: spreadsheetId, // ID del spreadsheet a modificar
            range: "A1:E1",               // Rango donde se colocarán los encabezados
            valueInputOption: "RAW",      // Opciones de entrada: RAW para texto sin procesar
            resource: {
                values: [                 // Valores a escribir en las celdas A1:E1
                    ["Número", "Longitud", "Expira", "Contraseña", "Palabra clave"]
                ]
            }
        });

        console.log('✅ Encabezados agregados correctamente');
        // Imprime en consola que los encabezados se agregaron sin errores

        // 💥 Solo imprime expiredRowIndices si existe
        if (typeof expiredRowIndices !== 'undefined' && Array.isArray(expiredRowIndices)) {
            console.log('Filas marcadas para eliminación (índices en Sheets):', expiredRowIndices.map(i => i + 1));
            // Si existe la variable expiredRowIndices (y es un arreglo), imprime los índices de las filas marcadas para eliminación,
            // sumando 1 porque en Google Sheets las filas empiezan en 1 (no en 0 como en JavaScript)
        }

        // Agregar formato profesional
        await gapi.client.sheets.spreadsheets.batchUpdate({
            spreadsheetId: spreadsheetId,  // ID del spreadsheet donde se aplicarán los cambios
            resource: {
                requests: [                // Lista de acciones a ejecutar en batch (grupo)
                    // Formato de encabezados
                    {
                        repeatCell: {
                            range: {
                                sheetId: 0,             // ID de la hoja (generalmente 0 para la hoja principal)
                                startRowIndex: 0,       // Empieza en fila 0 (encabezados)
                                endRowIndex: 1          // Termina en fila 1 (sin incluir fila 1, solo la 0)
                            },
                            cell: {
                                userEnteredFormat: {    // Estilo aplicado al contenido de las celdas
                                    backgroundColor: { red: 0.9, green: 0.9, blue: 0.9 }, // Color gris claro de fondo
                                    horizontalAlignment: 'CENTER',                         // Centrar texto horizontalmente
                                    textFormat: { bold: true }                            // Texto en negrita
                                }
                            },
                            fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)'
                            // Especifica qué campos del formato se aplican
                        }
                    },
                    // Ajustar manualmente el ancho de columnas
                    {
                        updateDimensionProperties: {
                            range: {
                                sheetId: 0,             // ID de la hoja
                                dimension: "COLUMNS",   // Aplica a columnas
                                startIndex: 0,          // Desde columna 0 (A)
                                endIndex: 5             // Hasta columna 5 (sin incluirla, cubre A-E)
                            },
                            properties: {
                                pixelSize: 200         // Ancho fijo de 200 píxeles para cada columna
                            },
                            fields: "pixelSize"        // Especifica que estamos actualizando el ancho (pixelSize)
                        }
                    }
                ]
            }
        });

        return spreadsheetId;
        // Devuelve el ID del spreadsheet creado al final de la función

    } catch (err) {
        console.error('❌ Error al crear spreadsheet:', err);
        // Si ocurre un error, lo muestra en consola con un mensaje claro

        throw err;
        // Lanza el error para que quien llame esta función pueda capturarlo y manejarlo
    }
}

// Copiar ID del archivo al portapapeles
function copyFileId(fileId) {
    if (fileId) {
        // Si existe un fileId válido, intenta copiarlo al portapapeles
        navigator.clipboard.writeText(fileId).then(() => {
            mostrarMensaje('✅ ID del archivo copiado al portapapeles');
            // Si la copia fue exitosa, muestra mensaje de éxito al usuario
        }).catch(err => {
            console.error('❌ Error al copiar el ID:', err);
            // Si hubo un error al copiar, lo muestra en la consola
            mostrarMensaje('❌ Error al copiar el ID');
            // Además, muestra mensaje de error al usuario
        });
    } else {
        mostrarMensaje('⚠️ No hay ningún ID para copiar.');
        // Si no hay fileId, avisa al usuario que no hay nada que copiar
    }
}

// Verifica si el spreadsheet existe; si no, lo crea
async function ensureSpreadsheetExists() {
    let spreadsheetIdInput = document.getElementById('spreadsheetIdInput').value.trim();
    // Obtiene el valor del input donde el usuario puede escribir un ID manualmente y le quita espacios

    let spreadsheetId = spreadsheetIdInput || localStorage.getItem('spreadsheetId');
    // Si el input tiene algo, lo usa; si no, toma el ID guardado en localStorage

    if (spreadsheetId) {
        try {
            // Intenta obtener el spreadsheet de Google Sheets usando el ID
            await gapi.client.sheets.spreadsheets.get({ spreadsheetId });
            console.log('✅ Spreadsheet encontrado, usando el mismo.');
            // Si funciona, muestra en consola que el archivo existe

            localStorage.setItem('spreadsheetId', spreadsheetId);
            // Guarda (o refresca) el ID en localStorage, por si vino del input

            return spreadsheetId;
            // Devuelve el ID encontrado (ya validado)
        } catch (error) {
            console.warn('⚠️ Spreadsheet ID inválido o archivo eliminado. Se creará uno nuevo.', error);
            // Si falla (ID inválido o archivo no existe), muestra advertencia en consola

            localStorage.removeItem('spreadsheetId');
            // Borra el ID malo del localStorage
        }
    }

    // Si no había ID válido o falló la validación, crea uno nuevo
    const newSpreadsheetId = await createSpreadsheetAndHeaders();
    // Llama a la función que crea un spreadsheet nuevo con encabezados

    return newSpreadsheetId;
    // Devuelve el nuevo ID
}

// Leer el último número usado
async function getLastSequenceNumber(spreadsheetId) {
    try {
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: spreadsheetId,
            range: "A:A" // Solicita solo la columna A (donde están los números de secuencia)
        });
        const rows = response.result.values || [];
        // Extrae las filas obtenidas de la respuesta; si no hay datos, usa arreglo vacío

        if (rows.length <= 1) {
            // Si solo hay encabezado (o está vacío), significa que aún no hay números, empieza desde 0
            return 0;
        }
        const lastRow = rows[rows.length - 1];
        // Obtiene la última fila del arreglo (la más reciente con datos)

        const lastNumber = parseInt(lastRow[0]);
        // Intenta convertir el valor de la primera celda de esa fila (columna A) a número entero
        return isNaN(lastNumber) ? 0 : lastNumber;
        // Si no es un número válido (NaN), regresa 0; si es válido, regresa el número
    } catch (err) {
        console.error('❌ Error al leer el último número:', err);
        // Si ocurre un error al consultar los datos, lo muestra en la consola

        return 0;
        // En caso de error, regresa 0 para no interrumpir el flujo del programa
    }
}

// Agregar datos al Spreadsheet
async function appendDataToSpreadsheet(spreadsheetId, values) {
    try {
        const response = await gapi.client.sheets.spreadsheets.values.append({
            spreadsheetId: spreadsheetId,
            range: "A1",
            // Indica que va a insertar datos a partir de la celda A1 (Google Sheets ajusta automáticamente a la última fila vacía)

            valueInputOption: "RAW",
            // Usa el valor tal cual (sin interpretar como fórmula ni formato especial)

            insertDataOption: "INSERT_ROWS",
            // Inserta los datos como nuevas filas

            resource: { values: [values] }
            // Pasa los valores a insertar (como arreglo dentro de arreglo, porque Sheets espera una matriz)
        });
        console.log('✅ Datos agregados:', response);
        // Muestra en consola que los datos se agregaron correctamente junto con la respuesta del API
    } catch (err) {
        console.error('❌ Error al agregar datos:', err);
        // Si ocurre un error al agregar los datos, lo muestra en consola
    }
}

// Elimina filas con contraseñas expiradas del spreadsheet
async function deleteExpiredPasswords(spreadsheetId) {
    if (!window.tablaCargada) {
        // Si la tabla aún no se cargó (variable global tablaCargada), no se puede continuar
        console.warn("❗ La tabla no ha sido cargada. No se pueden eliminar contraseñas.");
        return;
    }

    try {
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: spreadsheetId,
            range: "A2:E", // Lee desde la fila 2 (omitiendo encabezado) y columnas A a E
        });

        const rows = response.result.values || [];
        // Obtiene las filas leídas o usa un arreglo vacío si no hay datos

        if (rows.length === 0) {
            // Si no hay filas, muestra mensaje informativo y sale
            console.log('ℹ️ No hay contraseñas para revisar.');
            mostrarMensaje('✅ No hay contraseñas expiradas.');
            return;
        }

        const now = new Date();
        // Obtiene la fecha y hora actual

        const expiredRowIndices = [];
        // Prepara un arreglo para guardar los índices de las filas expiradas

        // Convierte una cadena de fecha personalizada en objeto Date
        function parseCustomDate(dateStr) {
            if (dateStr.toLowerCase() === 'sin expiración') {
                // Si el texto dice "sin expiración", regresa null
                return null;
            }

            // Detecta el formato DD/MM/YYYY, HH:mm
            const dateTimeRegex = /^(\d{2})\/(\d{2})\/(\d{4})(?:,)?\s*(\d{2}):(\d{2})$/;
            const match = dateStr.match(dateTimeRegex);
            if (match) {
                const day = parseInt(match[1], 10);
                const month = parseInt(match[2], 10) - 1; // Meses van de 0 a 11 en JS
                const year = parseInt(match[3], 10);
                const hours = parseInt(match[4], 10);
                const minutes = parseInt(match[5], 10);
                return new Date(year, month, day, hours, minutes);
            }

            console.warn(`❗ Formato de fecha no reconocido: ${dateStr}`);
            // Si no coincide el formato, avisa por consola y regresa null
            return null;
        }

        // Revisa cada fila para ver si expiró
        rows.forEach((row, index) => {
            const expTimeStr = row[2]; // Toma el valor de la columna 3 (índice 2)
            const expDate = parseCustomDate(expTimeStr);
            console.log(`Fila ${index + 2}: fecha raw=${expTimeStr}, parseada=${expDate}`);
            if (!expDate) return; // Si no hay fecha válida, la salta
            if (expDate < now) expiredRowIndices.push(index + 1);
            // Si la fecha es anterior a hoy, guarda su índice (index +1 porque empieza en fila 2)
        });

        if (expiredRowIndices.length === 0) {
            // Si no encontró expiradas, informa y sale
            console.log('✅ No hay contraseñas expiradas para borrar.');
            mostrarMensaje('✅ No hay contraseñas expiradas.');
            return;
        }

        console.log('❗ Fila(s) expirada(s) detectadas:', expiredRowIndices);

        expiredRowIndices.reverse(); // Invierte el arreglo para borrar desde abajo (evita desajustes al eliminar filas)

        // Prepara las solicitudes de eliminación para Google Sheets API
        const requests = expiredRowIndices.map(rowIndex => ({
            deleteDimension: {
                range: {
                    sheetId: 0, // ID de la hoja (generalmente 0 si es la hoja principal)
                    dimension: 'ROWS',
                    startIndex: rowIndex,
                    endIndex: rowIndex + 1,
                },
            },
        }));

        await gapi.client.sheets.spreadsheets.batchUpdate({
            spreadsheetId: spreadsheetId,
            resource: { requests },
        });
        // Envía las solicitudes de eliminación al API de Google Sheets

        console.log('✅ Contraseñas expiradas eliminadas.');
        mostrarMensaje(`🗑️ Se eliminaron ${expiredRowIndices.length} contraseñas expiradas.`);
        // Informa éxito en consola y en la interfaz
    } catch (err) {
        console.error('❌ Error al eliminar contraseñas expiradas:', err);
        mostrarMensaje('❌ Error al intentar eliminar contraseñas.');
        // Si ocurre error, lo reporta en consola y muestra mensaje al usuario
    }
}

let passwordAlreadySaved = false; // ← bandera global para controlar el guardado

// Evento principal: ejecuta cuando el DOM está cargado
document.addEventListener('DOMContentLoaded', function () {
    // Obtiene el token de autenticación guardado en localStorage
    const authToken = localStorage.getItem('authToken');
    // Si no hay token, avisa que no se cargan datos previos y termina
    if (!authToken) {
        console.log('No hay sesión activa. No cargar datos previos.');
        return;
    }

    // Asigna evento al botón de guardar contraseña
    document.getElementById('saveButton').addEventListener('click', async () => {
        // 🚀 PRIMERO: toma el ID del input (si existe), o localStorage
        let spreadsheetIdInput = document.getElementById('spreadsheetIdInput').value.trim();
        let spreadsheetId = spreadsheetIdInput || localStorage.getItem('spreadsheetId');
        // Si no hay spreadsheet, avisa al usuario y termina
        if (!spreadsheetId) {
            mostrarMensaje('⚠️ Primero debes crear o cargar el archivo antes de guardar contraseñas.');
            return;
        }

        // Obtiene el valor del campo de longitud de la contraseña
        const length = document.getElementById('length').value;
        // Obtiene la contraseña generada mostrada en pantalla
        let password = document.getElementById('result').innerText;

        // Si no hay contraseña generada, avisa al usuario y termina
        if (!password) {
            mostrarMensaje('⚠️ No has generado ninguna contraseña. Usa el generador primero.');
            return;
        }

        // ⛔ Si ya se guardó esta contraseña, bloquea el guardado
        if (passwordAlreadySaved) {
            mostrarMensaje('⚠️ Ya guardaste esta contraseña. Por favor, genera una nueva antes de guardar otra vez.');
            return;
        }

        // Pide al usuario una palabra clave para asociar a la contraseña
        const keyword = prompt('📝 Escribe la palabra clave para recordar dónde usarás esta contraseña:');

        // Si no se escribe palabra clave, avisa al usuario y termina
        if (keyword === null || keyword.trim() === "") {
            mostrarMensaje('⚠️ No escribiste una palabra clave. No se guardó la contraseña.');
            return;
        }

        // Obtiene los minutos de expiración seleccionados
        const expMinutes = parseInt(document.getElementById('expTime').value);

        // Variable para almacenar la fecha formateada de expiración
        let formattedExpTime;

        // Obtiene la hora actual
        const now = new Date();

        // Si se seleccionó tiempo de expiración, calcula la fecha futura formateada
        if (expMinutes > 0) {
            now.setMinutes(now.getMinutes() + expMinutes);
            formattedExpTime = `${now.getDate().toString().padStart(2, '0')}/` +
                `${(now.getMonth() + 1).toString().padStart(2, '0')}/` +
                `${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:` +
                `${now.getMinutes().toString().padStart(2, '0')}`;
        } else {
            // Si no se expirará, marca como "Sin expiración"
            formattedExpTime = 'Sin expiración';
        }

        // 🔐 CIFRADO SIEMPRE ACTIVADO
        // Pide una clave al usuario para cifrar la contraseña
        const clave = prompt("🔐 Introduce una clave para cifrar esta contraseña:");
        // Si no se da clave, avisa al usuario y termina
        if (!clave) {
            mostrarMensaje("❌ No se puede cifrar sin clave.");
            return;
        }

        try {
            // Cifra la contraseña usando la clave proporcionada
            password = await cifrado.cifrarTexto(password, clave);
        } catch (e) {
            // Si hay error al cifrar, avisa al usuario y lo muestra en consola
            mostrarMensaje("❌ Error al cifrar la contraseña.");
            console.error(e);
            return;
        }


        // Obtiene el último número de secuencia registrado en la hoja
        const lastSequenceNumber = await getLastSequenceNumber(spreadsheetId);
        // Calcula el nuevo número de secuencia
        const newSequenceNumber = lastSequenceNumber + 1;

        // Prepara los valores a guardar en el spreadsheet
        const values = [
            newSequenceNumber, // Número secuencial
            length,            // Longitud de la contraseña
            formattedExpTime,  // Fecha de expiración formateada
            password,          // Contraseña cifrada
            keyword            // Palabra clave
        ];

        // Agrega los datos al spreadsheet
        await appendDataToSpreadsheet(spreadsheetId, values);
        // Muestra mensaje de éxito al usuario
        mostrarMensaje('✅ Contraseña guardada');
        // ✅ Marca que la contraseña actual ya fue guardada
        passwordAlreadySaved = true;
    });

    // Asigna evento al botón de limpiar contraseñas expiradas
    document.getElementById('cleanExpired').addEventListener('click', async () => {
        // Verifica si la tabla está cargada
        if (!window.tablaCargada) {
            mostrarMensaje('❌ Primero carga la tabla.');
            return;
        }

        // Se asegura de que el spreadsheet exista y obtiene su ID
        const spreadsheetId = await ensureSpreadsheetExists();
        // Llama a la función para borrar las contraseñas expiradas
        await deleteExpiredPasswords(spreadsheetId);
    });
});



// Función para obtener las contraseñas desde Google Sheets
async function obtenerContraseñasDesdeSheets(spreadsheetId, range = 'Hoja 1!A2:E') {
    try {
        // Solicita los datos del rango especificado en el spreadsheet
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: spreadsheetId,
            range: range
        });
        // Devuelve los valores obtenidos o una lista vacía si no hay datos
        return response.result.values || [];
    } catch (error) {
        // Si ocurre un error al leer, lo muestra en consola y devuelve lista vacía
        console.error("❌ Error al leer Google Sheets:", error);
        return [];
    }
}
