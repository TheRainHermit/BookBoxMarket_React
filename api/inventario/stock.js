import pool from '../../src/db/pg/pgPool.js';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Listar stock de todas las cajas/productos
    try {
      const { rows } = await pool.query('SELECT id_caja, nombre, stock FROM cajas');
      res.status(200).json({ stock: rows });
    } catch (err) {
      res.status(500).json({ error: 'Error al obtener el stock' });
    }
  } else if (req.method === 'PUT') {
    // Actualizar stock de una caja/producto
    const { id_caja, stock } = req.body;
    if (!id_caja || typeof stock !== 'number') {
      return res.status(400).json({ error: 'Faltan parámetros id_caja o stock' });
    }
    try {
      await pool.query('UPDATE cajas SET stock = $1 WHERE id_caja = $2', [stock, id_caja]);
      res.status(200).json({ success: true, message: 'Stock actualizado' });
    } catch (err) {
      res.status(500).json({ error: 'Error al actualizar el stock' });
    }
  } else {
    res.status(405).json({ error: 'Método no permitido' });
  }
}