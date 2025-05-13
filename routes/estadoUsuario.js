// ✅ Importación de dependencias necesarias
const express = require('express');
const router = express.Router();
const User = require('../models/user');  // Asegúrate de que la ruta sea correcta y el modelo esté bien definido

// ✅ Ruta POST para verificar el estado del usuario
router.post('/estadoUsuario', async (req, res) => {
  const { correo } = req.body;

  // ⚠️ Validación básica: el campo 'correo' es obligatorio
  if (!correo) {
    return res.status(400).json({ error: 'Falta el correo.' });
  }

  try {
    // 🔍 Buscar el usuario en la base de datos por su correo
    const usuario = await User.findOne({ correo });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    const hoy = new Date(); // Fecha actual

    // ✅ Validación de membresía premium
    if (
      usuario.plan !== 'prueba' &&         // No está en plan prueba
      usuario.finPremium &&                // Tiene una fecha de finalización de premium
      new Date(usuario.finPremium) > hoy   // La membresía sigue vigente
    ) {
      return res.status(200).json({
        estado: 'premium',
        plan: usuario.plan,
        finPremium: usuario.finPremium,
      });
    }

    // ✅ Validación de periodo de prueba (7 días desde creación o fecha de generación de código)
    const fechaInicio = usuario.fechaGeneracion || usuario.creadoEn;
    const diasTranscurridos = Math.floor(
      (hoy - new Date(fechaInicio)) / (1000 * 60 * 60 * 24) // Cálculo en días
    );

    // ⏳ Si el usuario está dentro de los 7 días de prueba
    if (diasTranscurridos < 7) {
      return res.status(200).json({
        estado: 'prueba',
        plan: 'Periodo de prueba',
        finPremium: new Date(
          new Date(fechaInicio).getTime() + 7 * 24 * 60 * 60 * 1000
        ), // Calcula la fecha final de la prueba
        diasRestantes: 7 - diasTranscurridos, // Cuántos días de prueba le quedan
      });
    }

    // ❌ Si el periodo de prueba expiró y no tiene plan premium
    return res.status(200).json({
      estado: 'expirado',
      plan: 'Sin acceso',
      finPremium: null,
      mensaje: 'El periodo de prueba ha terminado.',
    });

  } catch (error) {
    console.error(error);
    // ⚠️ Error general en la base de datos o procesamiento
    return res.status(500).json({ error: 'Error al verificar estado del usuario.' });
  }
});

// ✅ Exporta el router para su uso en el archivo principal
module.exports = router;
