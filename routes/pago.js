// ✅ Importaciones necesarias
const express = require('express');
const router = express.Router(); // Crea un nuevo enrutador
const mongoose = require('mongoose'); // Para trabajar con MongoDB
const { v4: uuidv4 } = require('uuid'); // Generador de códigos únicos (UUID v4)
const { enviarCorreoCompra } = require('../api/sendMail'); // Función para enviar correos

// 🧠 Referencia al modelo de MongoDB (colección 'usuarios')
const Codigo = mongoose.model('usuarios');

// ✅ Ruta POST que simula una confirmación de pago y genera código premium
router.post('/confirmar', async (req, res) => {
    // 📨 Extrae los datos del cuerpo de la solicitud
    const { correo, plan, name } = req.body;

    // ⚠️ Verifica que todos los campos obligatorios estén presentes
    if (!correo || !plan || !name) {
        return res.status(400).json({ error: 'Faltan parámetros: correo y plan son requeridos.' });
    }

    // ✅ Valida que el plan recibido sea permitido (mensual o anual)
    const planesPermitidos = ['mensual', 'anual'];
    if (!planesPermitidos.includes(plan)) {
        return res.status(400).json({ error: 'El plan debe ser mensual o anual.' });
    }

    try {
        // 🔐 Genera un código único para activar la cuenta premium
        const codigo = uuidv4();

        // 📅 Calcula la duración del plan en milisegundos
        const ahora = new Date();
        const duracion = plan === 'anual'
            ? 365 * 24 * 60 * 60 * 1000  // 1 año en milisegundos
            : 30 * 24 * 60 * 60 * 1000;  // 30 días en milisegundos

        const fechaExpiracion = new Date(ahora.getTime() + duracion);

        // 🔍 Verifica si ya existe un código asociado al correo (usuario ya registrado)
        let codigoExistente = await Codigo.findOne({ correo });

        if (codigoExistente) {
            // ✏️ Si existe, actualiza la información del usuario
            codigoExistente.plan = plan;
            codigoExistente.codigo = codigo;
            codigoExistente.fechaGeneracion = ahora;
            codigoExistente.inicioPremium = ahora;
            codigoExistente.finPremium = fechaExpiracion;
            codigoExistente.codigoUsado = false;
            codigoExistente.name = name;
            await codigoExistente.save(); // 💾 Guarda los cambios
        } else {
            // 🆕 Si no existe, crea un nuevo usuario con el código generado
            const nuevoCodigo = new Codigo({
                correo,
                plan,
                codigo,
                fechaGeneracion: ahora,
                inicioPremium: ahora,
                finPremium: fechaExpiracion,
                codigoUsado: false,
                name
            });
            await nuevoCodigo.save(); // 💾 Guarda en la base de datos
        }

        // 📧 Envía un correo al usuario con el código generado y detalles del plan
        await enviarCorreoCompra(correo, plan, name, codigo);

        // ✅ Responde al cliente con los datos de la activación
        res.status(200).json({
            mensaje: '✅ Pago simulado exitosamente. Código generado.',
            correo,
            codigo,
            plan,
            inicioPremium: ahora,
            finPremium: fechaExpiracion,
            name
        });
    } catch (error) {
        // ❌ Manejo de errores inesperados
        console.error(error);
        res.status(500).json({ error: 'Error al procesar el pago.' });
    }
});

// ✅ Exporta el router para ser usado desde el archivo principal (server.js)
module.exports = router;
