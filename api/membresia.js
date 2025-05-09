export default function handler(req, res) {
    const { tipo } = req.query;
  
    const generarPassword = (length = 12) => {
      const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
      let password = '';
      for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return password;
    };
  
    let password;
    if (tipo === 'mensual') {
      password = generarPassword(12);
    } else if (tipo === 'anual') {
      password = generarPassword(20);
    } else {
      password = generarPassword(8);
    }
  
    res.status(200).json({ password });
  }