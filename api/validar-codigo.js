export default function handler(req, res) {
    const { codigo } = req.query;
  
    const codigosValidos = {
      mensual: 'membresia-mensual-123',
      anual: 'membresia-anual-456',
    };
  
    if (codigo === codigosValidos.mensual) {
      res.status(200).json({ status: 'ok', plan: 'mensual' });
    } else if (codigo === codigosValidos.anual) {
      res.status(200).json({ status: 'ok', plan: 'anual' });
    } else {
      res.status(401).json({ status: 'error', message: 'Código inválido' });
    }
  }