const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

async function conectarDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ Conectado a MongoDB con Mongoose");
  } catch (error) {
    console.error("❌ Error al conectar con Mongoose:", error);
    process.exit(1);
  }
}

module.exports = conectarDB;