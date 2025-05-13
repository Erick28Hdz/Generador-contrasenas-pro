const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  correo: { type: String, required: true, unique: true },
  plan: { type: String, default: 'prueba' }, // 'prueba', 'mensual', 'anual'
  finPrueba: { type: Date }, 
  pruebaExpirada: { type: Boolean, default: false },
  codigo: String,
  activo: { type: Boolean, default: false },
  creadoEn: { type: Date, default: Date.now },
  fechaGeneracion: Date,
  correoEnviado: { type: Boolean, default: false },
  codigoUsado: { type: Boolean, default: false },
  inicioPremium: { type: Date },
  finPremium: { type: Date },
});

module.exports = mongoose.model('Usuarios', userSchema);
