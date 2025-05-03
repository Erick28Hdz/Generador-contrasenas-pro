// Crear un nuevo spreadsheet y agregar encabezados
async function createSpreadsheetAndHeaders() {
    try {
        // Crea un nuevo Google Spreadsheet con el título especificado
        const response = await gapi.client.sheets.spreadsheets.create({
            properties: { title: "Generador de Contraseñas Pro" }
        });

        const spreadsheetId = response.result.spreadsheetId;
        localStorage.setItem('spreadsheetId', spreadsheetId); // Guarda el ID en localStorage

        // Muestra el ID en pantalla con un enlace para abrir el archivo y un botón para copiar el ID
        document.getElementById('content').innerHTML = `
            <p>📄 Nuevo documento creado:</p>
            <a href="https://docs.google.com/spreadsheets/d/${spreadsheetId}" target="_blank">Ver archivo</a>
            <button onclick="copyToClipboard('${spreadsheetId}')">📋 Copiar ID</button>
        `;

        mostrarMensaje(`🚀 ¡Nuevo Spreadsheet creado!\nID: ${spreadsheetId}`);

        // Agregar encabezados
        await gapi.client.sheets.spreadsheets.values.update({
            spreadsheetId: spreadsheetId,
            range: "A1:E1",
            valueInputOption: "RAW",
            resource: {
                values: [
                    ["Número", "Longitud", "Expira", "Contraseña", "Palabra clave"]
                ]
            }
        });

        console.log('✅ Encabezados agregados correctamente');
        console.log('Filas marcadas para eliminación (índices en Sheets):', expiredRowIndices.map(i => i + 1));
        // Agregar formato profesional
        await gapi.client.sheets.spreadsheets.batchUpdate({
            spreadsheetId: spreadsheetId,
            resource: {
                requests: [
                    // Formato de encabezados
                    {
                        repeatCell: {
                            range: {
                                sheetId: 0,
                                startRowIndex: 0,
                                endRowIndex: 1
                            },
                            cell: {
                                userEnteredFormat: {
                                    backgroundColor: { red: 0.9, green: 0.9, blue: 0.9 },
                                    horizontalAlignment: 'CENTER',
                                    textFormat: { bold: true }
                                }
                            },
                            fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)'
                        }
                    },
                    // Ajustar manualmente el ancho de columnas
                    {
                        updateDimensionProperties: {
                            range: {
                                sheetId: 0,
                                dimension: "COLUMNS",
                                startIndex: 0,
                                endIndex: 5
                            },
                            properties: {
                                pixelSize: 200 // Puedes variar este valor para cada columna si quieres
                            },
                            fields: "pixelSize"
                        }
                    }
                ]
            }
        });

        return spreadsheetId;
    } catch (err) {
        console.error('❌ Error al crear spreadsheet:', err);
        throw err;
    }
}

// Verifica si el spreadsheet existe; si no, lo crea
async function ensureSpreadsheetExists() {
    let spreadsheetIdInput = document.getElementById('spreadsheetIdInput').value.trim();
    let spreadsheetId = spreadsheetIdInput || localStorage.getItem('spreadsheetId');

    if (spreadsheetId) {
        try {
            // Intenta obtener el spreadsheet por su ID
            await gapi.client.sheets.spreadsheets.get({ spreadsheetId });
            console.log('✅ Spreadsheet encontrado, usando el mismo.');
            // Guardamos el ID bueno en localStorage por si vino del input
            localStorage.setItem('spreadsheetId', spreadsheetId); // Guarda el ID bueno
            return spreadsheetId;
        } catch (error) {
            console.warn('⚠️ Spreadsheet ID inválido o archivo eliminado. Se creará uno nuevo.', error);
            localStorage.removeItem('spreadsheetId'); // Limpia el ID malo
        }
    }

    // No había ID válido o falló, así que creamos uno nuevo
    const newSpreadsheetId = await createSpreadsheetAndHeaders();
    return newSpreadsheetId;
}

// Leer el último número usado
async function getLastSequenceNumber(spreadsheetId) {
    try {
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: spreadsheetId,
            range: "A:A" // Solo columna A
        });
        const rows = response.result.values || [];
        if (rows.length <= 1) {
            // Solo encabezado, así que el primer número será 1
            return 0;
        }
        // Tomar la última fila no vacía
        const lastRow = rows[rows.length - 1];
        const lastNumber = parseInt(lastRow[0]);
        return isNaN(lastNumber) ? 0 : lastNumber;
    } catch (err) {
        console.error('❌ Error al leer el último número:', err);
        return 0;
    }
}

// Agregar datos al Spreadsheet
async function appendDataToSpreadsheet(spreadsheetId, values) {
    try {
        const response = await gapi.client.sheets.spreadsheets.values.append({
            spreadsheetId: spreadsheetId,
            range: "A1",
            valueInputOption: "RAW",
            insertDataOption: "INSERT_ROWS",
            resource: { values: [values] }
        });
        console.log('✅ Datos agregados:', response);
    } catch (err) {
        console.error('❌ Error al agregar datos:', err);
    }
}

// Copiar al portapapeles
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        mostrarMensaje('✅ ID copiado');
    }).catch(err => {
        console.error('❌ Error al copiar:', err);
    });
}

// Elimina filas con contraseñas expiradas del spreadsheet
async function deleteExpiredPasswords(spreadsheetId) {
    if (!window.tablaCargada) {
        console.warn("❗ La tabla no ha sido cargada. No se pueden eliminar contraseñas.");
        return;
    }

    try {
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: spreadsheetId,
            range: "A2:E",
        });

        const rows = response.result.values || [];

        if (rows.length === 0) {
            console.log('ℹ️ No hay contraseñas para revisar.');
            mostrarMensaje('✅ No hay contraseñas expiradas.');
            return;
        }

        const now = new Date();
        const expiredRowIndices = [];

        // Convierte una cadena de fecha personalizada en objeto Date
        function parseCustomDate(dateStr) {
            if (dateStr.toLowerCase() === 'sin expiración') {
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
            return null;
        }

        // Revisa cada fila para ver si expiró
        rows.forEach((row, index) => {
            const expTimeStr = row[2];
            const expDate = parseCustomDate(expTimeStr);
            console.log(`Fila ${index + 2}: fecha raw=${expTimeStr}, parseada=${expDate}`);
            if (!expDate) return; // Saltar si no hay fecha válida (incluye "sin expiración")
            if (expDate < now) expiredRowIndices.push(index + 1);
        });

        if (expiredRowIndices.length === 0) {
            console.log('✅ No hay contraseñas expiradas para borrar.');
            mostrarMensaje('✅ No hay contraseñas expiradas.');
            return;
        }

        console.log('❗ Fila(s) expirada(s) detectadas:', expiredRowIndices);

        expiredRowIndices.reverse(); // Borra de abajo hacia arriba

        // Prepara las solicitudes de eliminación
        const requests = expiredRowIndices.map(rowIndex => ({
            deleteDimension: {
                range: {
                    sheetId: 0,
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

        console.log('✅ Contraseñas expiradas eliminadas.');
        mostrarMensaje(`🗑️ Se eliminaron ${expiredRowIndices.length} contraseñas expiradas.`);
    } catch (err) {
        console.error('❌ Error al eliminar contraseñas expiradas:', err);
        mostrarMensaje('❌ Error al intentar eliminar contraseñas.');
    }
}

// Evento principal: ejecuta cuando el DOM está cargado
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('saveButton').addEventListener('click', async () => {
        const spreadsheetId = await ensureSpreadsheetExists();

        const length = document.getElementById('length').value;
        let password = document.getElementById('result').innerText;

        if (!password) {
            mostrarMensaje('⚠️ No has generado ninguna contraseña. Usa el generador primero.');
            return;
        }
        const keyword = prompt('📝 Escribe la palabra clave para recordar dónde usarás esta contraseña:');

        if (keyword === null || keyword.trim() === "") {
            mostrarMensaje('⚠️ No escribiste una palabra clave. No se guardó la contraseña.');
            return;
        }

        const expMinutes = parseInt(document.getElementById('expTime').value); // ← OBTENER DEL SELECT

        // Obtener la hora actual
        const now = new Date();

        if (expMinutes > 0) {
            now.setMinutes(now.getMinutes() + expMinutes); // ← Solo si se seleccionó algo diferente de "sin expiración"
        }

        // Formato bonito: dd/mm/yyyy hh:mm
        formattedExpTime = `${now.getDate().toString().padStart(2, '0')}/` +
            `${(now.getMonth() + 1).toString().padStart(2, '0')}/` +
            `${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:` +
            `${now.getMinutes().toString().padStart(2, '0')}`;

        // 🔐 CIFRADO SIEMPRE ACTIVADO
        const clave = prompt("🔐 Introduce una clave para cifrar esta contraseña:");
        if (!clave) {
            mostrarMensaje("❌ No se puede cifrar sin clave.");
            return;
        }
        try {
            password = await cifrado.cifrarTexto(password, clave);
        } catch (e) {
            mostrarMensaje("❌ Error al cifrar la contraseña.");
            console.error(e);
            return;
        }

        const lastSequenceNumber = await getLastSequenceNumber(spreadsheetId);
        const newSequenceNumber = lastSequenceNumber + 1;

        const values = [
            newSequenceNumber,
            length,
            formattedExpTime, // ← FECHA FORMATEADA BONITO
            password,
            keyword
        ];

        await appendDataToSpreadsheet(spreadsheetId, values);
        mostrarMensaje('✅ Contraseña guardada');
    });
    document.getElementById('cleanExpired').addEventListener('click', async () => {
        if (!window.tablaCargada) {
            mostrarMensaje('❌ Primero carga la tabla.');
            return;
        }

        const spreadsheetId = await ensureSpreadsheetExists();
        await deleteExpiredPasswords(spreadsheetId);
    });
});


async function obtenerContraseñasDesdeSheets(spreadsheetId, range = 'Hoja 1!A2:E') {
    try {
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: spreadsheetId,
            range: range
        });
        return response.result.values || [];
    } catch (error) {
        console.error("❌ Error al leer Google Sheets:", error);
        return [];
    }
}
