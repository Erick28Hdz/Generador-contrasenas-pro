const crypto = require('crypto');

const apiKey = "4Vj8eK4rloUd272L48hsrarnUA";
const merchantId = "508029";
const referenceCode = "PLAN_MENSUAL_TEST_010";
const amount = "10000";
const currency = "COP";

const stringToHash = `${apiKey}~${merchantId}~${referenceCode}~${amount}~${currency}`;
const signature = crypto.createHash('md5').update(stringToHash).digest('hex');

console.log("Firma generada:", signature);
