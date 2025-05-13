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
