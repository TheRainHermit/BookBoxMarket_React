import pool from '../../../src/db/pg/pgPool.js';

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Falta el parámetro id' });
  }

  if (req.method === 'GET') {
    try {
      const { rows } = await pool.query('SELECT id_caja, stock FROM inventario WHERE id_caja = $1', [id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Caja no encontrada' });
      }
      // Devuelve en formato objeto
      res.status(200).json({ stock: { [rows[0].id_caja]: rows[0].stock } });
    } catch (err) {
      console.error("[Inventario][Stock][ID][GET]", {
        message: err.message,
        stack: err.stack,
        code: err.code,
        params: req.query,
        time: new Date().toISOString()
      });
      const isDev = process.env.NODE_ENV !== 'production';
      res.status(500).json({
        error: 'Error al obtener el stock',
        details: isDev ? err.message : undefined
      });
    }
  } else if (req.method === 'PUT') {
    const { stock } = req.body;
    if (typeof stock !== 'number') {
      return res.status(400).json({ error: 'Falta el parámetro stock' });
    }
    try {
      const result = await pool.query(
        'UPDATE inventario SET stock = $1 WHERE id_caja = $2 RETURNING id_caja, stock',
        [stock, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Caja no encontrada' });
      }
      // Devuelve el stock actualizado en formato objeto
      res.status(200).json({ success: true, stock: { [result.rows[0].id_caja]: result.rows[0].stock } });
    } catch (err) {
      console.error("[Inventario][Stock][ID][PUT]", {
        message: err.message,
        stack: err.stack,
        code: err.code,
        params: req.query,
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