function generarCodigoPremium() {
  const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let codigo = "";
  for (let i = 0; i < 10; i++) {
    codigo += letras[Math.floor(Math.random() * letras.length)];
  }
  return codigo;
}

module.exports = { generarCodigoPremium };