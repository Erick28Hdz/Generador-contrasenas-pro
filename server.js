// ✅ Importa Express, un framework para crear el servidor HTTP
const express = require('express');

// ✅ Importa Mongoose, una librería para interactuar con MongoDB desde Node.js
const mongoose = require('mongoose');

// ✅ Carga las variables de entorno desde el archivo .env
require('dotenv').config();

// ✅ Importa CORS, necesario para permitir peticiones desde otros dominios (como desde el frontend)
const cors = require('cors');

// ✅ Crea una instancia de la aplicación Express
const app = express();

// ✅ Define el puerto en el que el servidor escuchará (desde .env o por defecto el 3000)
const PORT = process.env.PORT || 3000;

// ✅ Middleware para analizar JSON en las peticiones (req.body)
app.use(express.json());

// ✅ Middleware CORS: permite que cualquier dominio pueda hacer peticiones al servidor (ideal para desarrollo)
app.use(cors());

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const API_KEY = process.env.GOOGLE_API_KEY;

// ✅ Conexión a la base de datos MongoDB Atlas usando la URI del archivo .env
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('✅ Conectado a MongoDB Atlas')) // Éxito en la conexión
    .catch(err => console.error('❌ Error al conectar a MongoDB:', err)); // Error en la conexión

// ✅ Servir archivos estáticos (HTML, CSS, JS, imágenes)
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Ruta raíz para mostrar el frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/google-config', (req, res) => {
    res.json({ clientId: process.env.GOOGLE_CLIENT_ID });
});

// ✅ Importa las rutas del sistema (cada archivo representa un módulo de tu API)
const userRoutes = require('./routes/user');                     // Rutas para registrar/gestionar usuarios
const membresiaRoutes = require('./routes/membresia');           // Rutas para simular pagos y generar códigos
const webhookRoutes = require("./routes/webhook");               // Ruta para recibir notificaciones (por ejemplo, de una pasarela de pagos)
const verificarCodigoRoutes = require("./routes/verificarCodigo"); // Ruta para verificar y activar códigos premium
const estadoUsuarioRoutes = require('./routes/estadoUsuario');   // Ruta para consultar el estado del usuario premium

// ✅ Asocia cada grupo de rutas con un prefijo de URL
app.use('/api/users', userRoutes);           // ej: POST /api/users/registrar
app.use('/api/membresia', membresiaRoutes);  // ej: POST /api/membresia/confirmar
app.use("/api", webhookRoutes);              // ej: POST /api/webhook
app.use('/api', verificarCodigoRoutes);      // ej: POST /api/verificarCodigo
app.use('/api', estadoUsuarioRoutes);        // ej: GET /api/estadoUsuario/:correo

// ✅ Inicia el servidor en el puerto especificado
app.listen(PORT, () => {
    console.log(`Servidor escuchando en https://https://generador-contrasenas-pro.onrender.com:${PORT}`);
});
