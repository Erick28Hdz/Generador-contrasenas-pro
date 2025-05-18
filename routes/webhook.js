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
  res.send(`
    <html>
      <head><title>Pago exitoso</title></head>
      <body style="font-family:sans-serif; text-align:center; padding:2rem;">
        <h1>✅ ¡Gracias por tu compra!</h1>
        <p>Tu transacción ha sido aprobada. Revisa tu correo para más detalles.</p>
        <a href="https://generador-contrasenas-pro.onrender.com/" style="display:inline-block; margin-top:1rem; text-decoration:none; color:white; background:#007bff; padding:0.5rem 1rem; border-radius:5px;">Volver a la app</a>
      </body>
    </html>
  `);
});

module.exports = router;