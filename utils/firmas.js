const crypto = require('crypto');

/**
 * Genera la firma MD5 para una transacción de PayU
 * @param {Object} data - Datos recibidos de PayU
 * @param {string} apiKey - API KEY de PayU (desde .env)
 * @param {string} merchantId - Merchant ID de PayU (desde .env)
 * @returns {string} Firma MD5 generada localmente
 */
function generarFirmaPayU(data, apiKey, merchantId) {
  const {
    reference_sale,
    value,
    currency,
    state_pol
  } = data;

  const monto = parseFloat(value).toFixed(2); // Asegura dos decimales exactos

  const cadena = [
    String(apiKey),
    String(merchantId),
    String(reference_sale),
    String(monto),
    String(currency),
    String(state_pol)
  ].map(x => x.trim()).join("~");

  const firma = crypto.createHash("md5").update(cadena).digest("hex");
  return firma;
}

module.exports = { generarFirmaPayU };
