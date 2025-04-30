// Crear un nuevo spreadsheet y agregar encabezados
async function createSpreadsheetAndHeaders() {
    try {
        const response = await gapi.client.sheets.spreadsheets.create({
            properties: { title: "Generador de Contraseñas Pro" }
        });

        const spreadsheetId = response.result.spreadsheetId;
        localStorage.setItem('spreadsheetId', spreadsheetId);

        // Mostrar ID en pantalla
        document.getElementById('content').innerHTML = `
            <p>📄 Nuevo documento creado:</p>
            <a href="https://docs.google.com/spreadsheets/d/${spreadsheetId}" target="_blank">Ver Spreadsheet</a>
            <button onclick="copyToClipboard('${spreadsheetId}')">📋 Copiar ID</button>
        `;

        alert(`🚀 ¡Nuevo Spreadsheet creado!\nID: ${spreadsheetId}`);

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

async function ensureSpreadsheetExists() {
    let spreadsheetIdInput = document.getElementById('spreadsheetIdInput').value.trim();
    let spreadsheetId = spreadsheetIdInput || localStorage.getItem('spreadsheetId');

    if (spreadsheetId) {
        try {
            await gapi.client.sheets.spreadsheets.get({ spreadsheetId });
            console.log('✅ Spreadsheet encontrado, usando el mismo.');
            // Guardamos el ID bueno en localStorage por si vino del input
            localStorage.setItem('spreadsheetId', spreadsheetId);
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
        alert('✅ ID copiado');
    }).catch(err => {
        console.error('❌ Error al copiar:', err);
    });
}

async function deleteExpiredPasswords(spreadsheetId) {
    try {
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: spreadsheetId,
            range: "A2:E", // Saltamos A1:E1 porque son encabezados
        });

        const rows = response.result.values || [];

        if (rows.length === 0) {
            console.log('ℹ️ No hay contraseñas para revisar.');
            alert('✅ No hay contraseñas expiradas.');
            return;
        }

        const now = new Date();
        const expiredRowIndices = [];

        // ⚡ Función para parsear fechas bonitas o ISO
        function parseCustomDate(str) {
            if (!str) return null;

            // Primero intentar como ISO
            const isoDate = new Date(str);
            if (!isNaN(isoDate.getTime())) {
                return isoDate;
            }

            // Si falla, intentar como formato español
            const [datePart, timePart] = str.split(',');
            if (!datePart || !timePart) return null;

            const [day, month, year] = datePart.trim().split('/');
            const [hours, minutes] = timePart.trim().split(':');
            return new Date(year, month - 1, day, hours, minutes);
        }

        rows.forEach((row, index) => {
            const expTimeStr = row[2]; // Columna C (índice 2)
            if (!expTimeStr) return; // Si está vacío, saltar

            const expDate = parseCustomDate(expTimeStr);

            if (expDate && expDate < now) {
                // Fila expirada, guardar su índice real (index + 1 porque A2 es fila 2)
                expiredRowIndices.push(index + 1);
            }
        });

        if (expiredRowIndices.length === 0) {
            console.log('✅ No hay contraseñas expiradas para borrar.');
            alert('✅ No hay contraseñas expiradas.');
            return;
        }

        console.log('❗ Fila(s) expirada(s) detectadas:', expiredRowIndices);

        // Borrar las filas de atrás hacia adelante
        expiredRowIndices.reverse();

        const requests = expiredRowIndices.map(rowIndex => ({
            deleteDimension: {
                range: {
                    sheetId: 0, // Usualmente la hoja principal es ID 0
                    dimension: 'ROWS',
                    startIndex: rowIndex,
                    endIndex: rowIndex + 1
                }
            }
        }));

        await gapi.client.sheets.spreadsheets.batchUpdate({
            spreadsheetId: spreadsheetId,
            resource: {
                requests: requests
            }
        });

        console.log('✅ Contraseñas expiradas eliminadas.');
        alert(`🗑️ Se eliminaron ${expiredRowIndices.length} contraseñas expiradas.`);
    } catch (err) {
        console.error('❌ Error al eliminar contraseñas expiradas:', err);
        alert('❌ Error al intentar eliminar contraseñas.');
    }
}

// Evento principal
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('saveButton').addEventListener('click', async () => {
        const spreadsheetId = await ensureSpreadsheetExists();

        const length = document.getElementById('length').value;
        let password = document.getElementById('result').innerText;
        const keyword = prompt('📝 Escribe la palabra clave para recordar dónde usarás esta contraseña:');

        if (keyword === null || keyword.trim() === "") {
            alert('⚠️ No escribiste una palabra clave. No se guardó la contraseña.');
            return;
        }

        const expMinutes = parseInt(document.getElementById('expTime').value); // ← OBTENER DEL SELECT

        // Obtener la hora actual
        const now = new Date();

        if (expMinutes > 0) {
            now.setMinutes(now.getMinutes() + expMinutes); // ← Solo si se seleccionó algo diferente de "sin expiración"
        }

        // Formato bonito: dd/mm/yyyy hh:mm
        const formattedExpTime = now.toLocaleString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });

        // ✅ 🔐 CIFRADO SI EL USUARIO LO ACTIVÓ
        if (cifradoActivado) {
            const clave = prompt("🔐 Introduce una clave para cifrar esta contraseña:");
            if (!clave) {
                alert("❌ No se puede cifrar sin clave.");
                return;
            }
            try {
                password = await cifrado.cifrarTexto(password, clave); // ← ahora sí funcionará
            } catch (e) {
                alert("❌ Error al cifrar la contraseña.");
                console.error(e);
                return;
            }
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
    });
    document.getElementById('cleanExpired').addEventListener('click', async () => {
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
