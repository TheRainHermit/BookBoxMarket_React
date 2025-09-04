import pool from '../../src/db/pg/pgPool.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { rows } = await pool.query('SELECT id_caja, nombre_caja, stock FROM cajas');
      res.status(200).json({ stock: rows });
    } catch (err) {
      console.error("[Inventario][Stock][GET]", {
        message: err.message,
        stack: err.stack,
        code: err.code,
        time: new Date().toISOString()
      });
      const isDev = process.env.NODE_ENV !== 'production';
      res.status(500).json({
        error: 'Error al obtener el stock',
        details: isDev ? err.message : undefined
      });
    }
  } else if (req.method === 'PUT') {
    const { id_caja, stock } = req.body;
    if (!id_caja || typeof stock !== 'number') {
      return res.status(400).json({ error: 'Faltan parámetros id_caja o stock' });
    }
    try {
      await pool.query('UPDATE cajas SET stock = $1 WHERE id_caja = $2', [stock, id_caja]);
      res.status(200).json({ success: true, message: 'Stock actualizado' });
    } catch (err) {
      console.error("[Inventario][Stock][PUT]", {
        message: err.message,
        stack: err.stack,
        code: err.code,
        body: req.body,
        time: new Date().toISOString()
      });
      const isDev = process.env.NODE_ENV !== 'production';
      res.status(500).json({
        error: 'Error al actualizar el stock',
        details: isDev ? err.message : undefined
      });
    }
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
}