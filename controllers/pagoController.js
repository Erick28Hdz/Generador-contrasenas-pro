const { generarCodigoPremium } = require("../utils/generarCodigo");
const conectarDB = require("../database/db"); // Este archivo solo conecta con Mongoose
const User = require("../models/user");
const { enviarCorreoCompra } = require("../api/sendMail");

async function recibirConfirmacionPayU(req, res) {
  try {
    const data = req.body;
    console.log("🧾 Webhook recibido de PayU:", data);

    if (data && data.estado_pol === "4") {
      const correo = data.email_buyer || data.buyerEmail || data.payerEmail;
      if (!correo) {
        return res.status(400).send("❌ Correo no especificado");
      }

      await conectarDB(); // ✅ Conecta con Mongoose

      const usuarioExistenteActivo = await User.findOne({ correo, activo: true });

      if (usuarioExistenteActivo) {
        return res
          .status(400)
          .send(`❌ Ya existe una membresía activa para este correo (${correo}) con el plan: ${usuarioExistenteActivo.plan}`);
      }

      const usuario = await User.findOne({ correo });

      if (!usuario) {
        return res.status(404).send(`❌ No se encontró ningún usuario con el correo: ${correo}`);
      }

      const codigo = generarCodigoPremium();
      const plan = data.description || "Membresía Premium";

      // 📝 Actualiza usuario existente
      usuario.codigo = codigo;
      usuario.creadoEn = new Date();
      usuario.activo = true;
      usuario.plan = plan;
      usuario.correoEnviado = false;
      usuario.codigoUsado = false;
      await usuario.save();
      console.log(`✅ Usuario actualizado con nuevo código: ${codigo}`);

      // 📨 Enviar correo con el código
      try {
        await enviarCorreoCompra(correo, plan, usuario.name, codigo );
        usuario.correoEnviado = true;
        await usuario.save();
      } catch (error) {
        console.error("⚠️ Error al enviar el correo:", error);
      }

      return res.status(200).send("✅ Código generado y correo enviado.");
    }

    return res.status(200).send("⏳ Pago no aprobado aún.");
  } catch (error) {
    console.error("❌ Error en webhook de PayU:", error);
    return res.status(500).send("Error en el servidor");
  }
}

module.exports = { recibirConfirmacionPayU };
