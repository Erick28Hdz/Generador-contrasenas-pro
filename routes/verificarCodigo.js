// ✅ Importa Express y crea un enrutador independiente
const express = require("express");
const router = express.Router();

// ✅ Importa el modelo de usuario desde tu esquema de MongoDB
const User = require("../models/user"); // Ajusta según tu estructura

// ✅ Importa la función que conecta con la base de datos MongoDB
const conectarDB = require("../database/db");

// ✅ Ruta POST para verificar un código
router.post("/verificarCodigo", async (req, res) => {
  // 🟡 Extrae el código enviado por el cliente en el body
  const { codigo } = req.body;

  // ✅ Establece la conexión con la base de datos
  await conectarDB();

  // 🔍 Busca un usuario con ese código que además esté activo
  const usuario = await User.findOne({ codigo, activo: true });

  // ⚠️ Si no existe el usuario o el código no está activo, responde con error
  if (!usuario) {
    return res.status(404).json({ error: "Código inválido o no activo" });
  }

  // ⚠️ Si el código ya fue usado anteriormente, devuelve error
  if (usuario.codigoUsado) {
    return res.status(400).json({ error: "⚠️ Este código ya fue usado" });
  }

  // 📅 Obtiene la fecha y hora actual
  const ahora = new Date();

  // 🧮 Calcula la duración del plan dependiendo del tipo
  let duracion;
  if (
    usuario.plan === "Membresía Premium Anual" ||  // Caso para plan anual
    usuario.plan === "anual" ||
    usuario.plan ==="Subscripción premium gen-contraseñas-pro"
  ) {
    duracion = 365; // 365 días
  } else if (
    usuario.plan === "Membresía Premium Mensual" || // Caso para plan mensual
    usuario.plan === "mensual" ||
    usuario.plan === "Membresía Premium" ||
    usuario.plan ==="Subscripción básica gen-contraseñas-pro"
  ) {
    duracion = 30; // 30 días
  } else {
    // ❌ Si el plan no se reconoce, responde con error
    return res.status(400).json({ error: "Plan desconocido" });
  }

  // 📅 Calcula la fecha de expiración sumando los días de duración al día actual
  const fin = new Date(ahora);
  fin.setDate(fin.getDate() + duracion);

  // ✅ Marca el código como usado y guarda las fechas de membresía
  usuario.codigoUsado = true;
  usuario.inicioPremium = ahora;
  usuario.finPremium = fin;
  await usuario.save();

  // ✅ Responde al cliente con los datos del estado premium
  return res.status(200).json({
    premiumActivo: true,
    plan: usuario.plan,
    inicio: usuario.inicioPremium,
    fin: usuario.finPremium,
  });
});

// ✅ Exporta el router para ser usado en tu servidor principal (server.js)
module.exports = router;
