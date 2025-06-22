// ✅ Importa Express para crear un router modular (sistema de rutas separado)
const express = require("express");

// ✅ Crea una nueva instancia de Router que permite definir rutas en este archivo
const router = express.Router();

// ✅ Importa el controlador que maneja la lógica cuando PayU confirma un pago
const { recibirConfirmacionPayU } = require("../controllers/pagoController");

// ✅ Define una ruta POST para cuando PayU envíe una confirmación de pago (webhook)
// Por ejemplo, PayU llamará a: http://tu-servidor/api/payu/confirmacion
router.post("/payu/confirmacion", recibirConfirmacionPayU);

// ✅ Exporta el router para que pueda ser usado en server.js
module.exports = router;


router.get("/payu/respuesta", (req, res) => {
  const estado = req.query.state_pol;

  let mensaje = "Procesando...";
  let detalle = "Estamos verificando el estado de tu transacción.";

  if (estado === "4") {
    mensaje = "✅ ¡Gracias por tu compra!";
    detalle = "Tu transacción ha sido aprobada. Revisa tu correo para más detalles.";
  } else if (estado === "6") {
    mensaje = "❌ Pago rechazado";
    detalle = "Tu transacción fue rechazada. Intenta con otro método de pago.";
  } else if (estado === "5") {
    mensaje = "⌛ Pago expirado";
    detalle = "El tiempo para completar el pago ha expirado. Inténtalo nuevamente.";
  } else if (estado === "7") {
    mensaje = "⏳ Pago pendiente";
    detalle = "Tu pago está en proceso. Te notificaremos cuando se apruebe.";
  }

  res.send(`
    <html>
      <head><title>Estado del pago</title></head>
      <body style="font-family:sans-serif; text-align:center; padding:2rem;">
        <h1>${mensaje}</h1>
        <p>${detalle}</p>
        <a href="https://generador-contrasenas-pro.onrender.com/" style="display:inline-block; margin-top:1rem; text-decoration:none; color:white; background:#007bff; padding:0.5rem 1rem; border-radius:5px;">Volver a la app</a>
      </body>
    </html>
  `);
});

module.exports = router;