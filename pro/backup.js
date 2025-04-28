// Verifica si el usuario está autenticado y si el token es válido.
function initGoogleAPI() {
    const accessToken = localStorage.getItem("accessToken");
  
    if (!accessToken) {
      console.error("❌ No se encontró accessToken.");
      return;
    }
  
    // Inicializar la API de Google usando el token de acceso
    gapi.load("client", () => {
      gapi.client.init({
        apiKey: "AIzaSyCaE-jca1N5lxx7Uh1H7f3F6xTpUBV_vjQ", // No es necesario si no lo usas
        discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
      }).then(() => {
        // Establecer el access token para autenticar todas las solicitudes
        gapi.client.setToken({ access_token: accessToken });
        console.log("✅ GAPI inicializado con accessToken");
  
        // Aquí puedes llamar a la función para cargar Drive u otras APIs si las necesitas
        gapi.client.load("drive", "v3").then(() => {
          console.log("Google Drive API cargada");
        }).catch((error) => {
          console.error("❌ Error al cargar Google Drive API:", error);
        });
  
      }).catch((error) => {
        console.error("❌ Error al inicializar GAPI:", error);
      });
    });
  }
  
  // Función para crear una hoja de cálculo para un usuario
  function crearHojaDeCalculoParaUsuario() {
    const userEmail = localStorage.getItem("usuarioEmail");
  
    if (!userEmail) {
      alert("Error: Usuario no autenticado.");
      return;
    }
  
    const nombreHoja = `${userEmail}-contraseñas`;
  
    const fileMetadata = {
      name: nombreHoja,
      mimeType: "application/vnd.google-apps.spreadsheet",
    };
  
    // Crear el archivo de Google Sheets en Google Drive
    gapi.client.drive.files.create({
      resource: fileMetadata,
      fields: "id",
    }).then((response) => {
      const hojaId = response.result.id;
      console.log("✅ Hoja de cálculo creada:", hojaId);
  
      // Guardar el ID de la hoja en el almacenamiento local
      localStorage.setItem("hojaId", hojaId);
      alert(`Hoja de cálculo creada con éxito para ${userEmail}`);
    }).catch((error) => {
      console.error("❌ Error al crear la hoja de cálculo:", error);
      alert("Error al crear la hoja de cálculo");
    });
  }
  
  // Función para guardar una contraseña en la hoja de cálculo
  function guardarContraseña() {
    const hojaId = localStorage.getItem("hojaId");
    const contraseña = document.getElementById("contraseña").value; // Contraseña del input
  
    if (!hojaId) {
      alert("¡No se ha creado una hoja para este usuario!");
      return;
    }
  
    if (!contraseña) {
      alert("Por favor, ingresa una contraseña para guardar.");
      return;
    }
  
    // Guardar la contraseña en Google Sheets
    const values = [
      [new Date().toISOString(), contraseña], // Fecha y contraseña
    ];
  
    const body = {
      values: values,
    };
  
    gapi.client.sheets.spreadsheets.values.append({
      spreadsheetId: hojaId,
      range: "Sheet1!A:B", // Rango donde se guardarán los datos
      valueInputOption: "RAW",
      resource: body,
    }).then((response) => {
      console.log("✅ Contraseña guardada con éxito:", response);
      alert("Contraseña guardada con éxito");
    }).catch((error) => {
      console.error("❌ Error al guardar la contraseña:", error);
      alert("Error al guardar la contraseña");
    });
  }
  
  // Espera que el DOM esté listo para asociar eventos
  document.addEventListener("DOMContentLoaded", () => {
    const botonGuardarContraseña = document.getElementById("guardarContraseña");
  
    // Verificar si el usuario está autenticado
    botonGuardarContraseña.addEventListener("click", () => {
      const userEmail = localStorage.getItem("usuarioEmail");
  
      if (!userEmail) {
        alert("¡Inicia sesión primero!");
        return;
      }
  
      // Si ya existe la hoja, no la creamos de nuevo
      const hojaId = localStorage.getItem("hojaId");
      if (!hojaId) {
        // Si no existe, la creamos
        crearHojaDeCalculoParaUsuario();
      }
  
      // Guardar la contraseña en la hoja
      guardarContraseña();
    });
  });
  
  // Esta función se ejecuta cuando el script de Google API es cargado
  window.onload = function() {
    initGoogleAPI();
  };
  