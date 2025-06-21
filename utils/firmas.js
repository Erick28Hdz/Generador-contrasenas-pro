const crypto = require("crypto");

function generarFirmaPayU(data, apiKey, merchantId) {
  const referenceCode = data.reference_sale?.trim();
  const transactionState = data.state_pol;
  const currency = data.currency;
  
  // ATENCIÓN: Usar el TX_VALUE tal como lo enviaste originalmente
  const rawValue = parseFloat(data.value).toFixed(2); // value DEBE coincidir con lo enviado
  const cadena = [apiKey, merchantId, referenceCode, rawValue, currency, transactionState].join("~");

  const firma = crypto.createHash("md5").update(cadena).digest("hex");

  console.log("🧪 Cadena generada:", cadena);
  console.log("✅ Firma generada:", firma);
  console.log("❓ Firma esperada (desde webhook):", data.sign);

  if (firma !== data.sign) {
    console.warn("⚠️ Las firmas NO coinciden. Revisa el valor TX_VALUE.");
  }

  return firma;
}
