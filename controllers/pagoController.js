const { generarCodigoPremium } = require("../utils/generarCodigo");
const conectarDB = require("../database/db");
const User = require("../models/user");
const { enviarCorreoCompra } = require("../api/sendMail");
const crypto = require("crypto");
require('dotenv').config();

async function recibirConfirmacionPayU(req, res) {

  try {
    const data = req.body;
    console.log("🧾 Webhook recibido de PayU:", data);

    const API_KEY = process.env.PAYU_API_KEY;
    const MERCHANT_ID = process.env.PAYU_MERCHANT_ID;
    const reference_sale = data.reference_sale;
    const value = parseFloat(data.value).toFixed(2);  // Asegura formato correcto
    const currency = data.currency;
    const state_pol = data.state_pol;
    // 🧾 Asignar la firma enviada por PayU
    const firmaPayU = data.sign;

    const cadena = [
      API_KEY,
      MERCHANT_ID,
      reference_sale,
      value,
      currency,
      state_pol
    ].map(x => x.trim()).join("~");

    const firma = crypto.createHash("md5").update(cadena).digest("hex");

    console.log("💰 Valor original recibido:", data.value);
    console.log("🔐 Cadena para firma:", cadena);
    console.log("📌 Firma local:", firma);
    console.log("📌 Firma PayU:", firmaPayU);

    // Compara las firmas
    if (firma.trim().toLowerCase() !== firmaPayU.trim().toLowerCase()) {
      console.warn("❌ Firma inválida");
      return res.status(403).send("Firma no válida");
    }

    const estado = data.state_pol;
    const correo = data.email_buyer || data.buyerEmail || data.payerEmail;

    if (!correo) {
      return res.status(400).send("❌ Correo no especificado");
    }

    await conectarDB();

    if (estado === "4") {
      const usuarioExistenteActivo = await User.findOne({ correo, activo: true });

      if (usuarioExistenteActivo) {
        return res.status(400).send(`❌ Ya existe una membresía activa para este correo (${correo}) con el plan: ${usuarioExistenteActivo.plan}`);
      }

      const usuario = await User.findOne({ correo });
      if (!usuario) return res.status(404).send(`❌ No se encontró ningún usuario con el correo: ${correo}`);

      const codigo = generarCodigoPremium();
      const plan = data.description || "Membresía Premium";

      usuario.codigo = codigo;
      usuario.creadoEn = new Date();
      usuario.activo = true;
      usuario.plan = plan;
      usuario.correoEnviado = false;
      usuario.codigoUsado = false;
      await usuario.save();
      console.log(`✅ Usuario actualizado con nuevo código: ${codigo}`);

      try {
        await enviarCorreoCompra(correo, plan, usuario.name, codigo);
        usuario.correoEnviado = true;
        await usuario.save();
      } catch (error) {
        console.error("⚠️ Error al enviar el correo:", error);
      }

      return res.status(200).send("✅ Código generado y correo enviado.");
    }

    if (estado === "6") return res.status(200).send("❌ Pago rechazado.");
    if (estado === "7") return res.status(200).send("⏳ Pago pendiente.");
    if (estado === "5") return res.status(200).send("⌛ Pago expirado.");

    return res.status(200).send("ℹ️ Estado de pago no manejado aún.");
  } catch (error) {
    console.error("❌ Error en webhook de PayU:", error);
    return res.status(500).send("Error en el servidor");
  }
}

module.exports = { recibirConfirmacionPayU };
