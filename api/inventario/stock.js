import pool from '../../src/db/pg/pgPool.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { rows } = await pool.query('SELECT id_caja, stock FROM inventario');
      const stockObj = {};
      rows.forEach(item => {
        stockObj[item.id_caja] = item.stock;
      });
      res.status(200).json({ stock: stockObj });
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
      await pool.query('UPDATE inventario SET stock = $1 WHERE id_caja = $2', [stock, id_caja]);
      // Después de actualizar, devuelve el stock completo como objeto
      const { rows } = await pool.query('SELECT id_caja, stock FROM inventario');
      const stockObj = {};
      rows.forEach(item => {
        stockObj[item.id_caja] = item.stock;
      });
      res.status(200).json({ success: true, stock: stockObj });
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