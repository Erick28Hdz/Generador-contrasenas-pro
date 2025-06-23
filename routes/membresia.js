// ✅ Importaciones necesarias
const express = require('express');
const { v4: uuidv4 } = require('uuid'); // Para generar códigos únicos
const mongoose = require('mongoose');
const { enviarCorreoRegistro } = require('../api/sendMail'); // Función para enviar correos de bienvenida o activación

const router = express.Router(); // Crea el enrutador

// ✅ Definición del esquema para el modelo 'usuarios'
const CodigoSchema = new mongoose.Schema({
    name: String,
    correo: String,
    plan: String,
    codigo: { type: String, default: null }, // Código generado (solo si no es plan de prueba)
    fechaGeneracion: { type: Date, default: null } // Fecha en la que se generó el código
});

// 🔄 Modelo basado en el esquema anterior
const Codigo = mongoose.model('usuarios', CodigoSchema);

// ✅ Ruta POST: Registra un nuevo usuario o actualiza el plan
router.post('/', async (req, res) => {
    const { name, correo, plan } = req.body;

    // ⚠️ Validación de campos requeridos
    if (!correo || !plan || !name) {
        return res.status(400).json({ error: 'Faltan parámetros: correo y plan son requeridos.' });
    }

    // ✅ Solo permite ciertos planes
    const planesDisponibles = ['Prueba', 'Mensual', 'Anual'];
    if (!planesDisponibles.includes(plan)) {
        return res.status(400).json({ error: 'Plan no válido.' });
    }

    try {
        // 🔍 Verifica si ya existe el usuario por su correo
        let usuario = await Codigo.findOne({ correo });

        if (usuario) {
            // ✏️ Si el usuario ya existe y cambia a un plan de pago, genera código nuevo
            if (plan !== 'Prueba') {
                const codigoGenerado = uuidv4();
                usuario.plan = plan;
                usuario.codigo = codigoGenerado;
                usuario.fechaGeneracion = new Date();
                if (!usuario.name) usuario.name = name; // Si no tenía nombre, lo guarda
                await usuario.save();

                // 📧 Enviar correo con el código
                await enviarCorreoRegistro(correo, plan, codigoGenerado);

                return res.status(200).json({
                    mensaje: `Código generado para el plan ${plan}`,
                    correo,
                    codigo: codigoGenerado
                });
            }

            // Si ya tiene plan prueba, no se actualiza nada
            return res.status(200).json({ mensaje: 'Usuario ya registrado con plan prueba.', correo });
        } else {
            // 🆕 Registrar nuevo usuario con plan de prueba
            const sieteDias = 7 * 24 * 60 * 60 * 1000; // 7 días en milisegundos
            const fechaActual = new Date();

            const nuevoUsuario = new Codigo({
                name,
                correo,
                plan,
                codigo: null,
                fechaGeneracion: fechaActual,
                creadoEn: fechaActual,
                finPrueba: new Date(fechaActual.getTime() + sieteDias),
                pruebaExpirada: false
            });
            await nuevoUsuario.save();

            // 📧 Enviar correo de bienvenida (sin código)
            await enviarCorreoRegistro(correo, plan, name);

            return res.status(200).json({
                mensaje: `Usuario registrado con plan ${plan}`,
                correo
            });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error interno al procesar la solicitud.' });
    }
});

// ✅ Ruta GET: Consultar la membresía de un usuario por su correo
// Ejemplo: GET /api/membresia/usuario@correo.com
router.get('/:correo', async (req, res) => {
    const { correo } = req.params;
    try {
        const usuario = await Codigo.findOne({ correo });
        if (!usuario) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        // Devuelve el plan actual del usuario
        res.json({
            correo: usuario.correo,
            plan: usuario.plan
        });
    } catch (error) {
        console.error('Error al obtener membresía:', error);
        res.status(500).json({ mensaje: 'Error del servidor' });
    }
});

module.exports = router; // Exporta el router para usarlo en app.js o server.js
