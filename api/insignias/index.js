import pool from '../../src/db/pg/pgPool.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }
  try {
    const { rows } = await pool.query('SELECT * FROM insignias');
    res.status(200).json(rows);
  } catch (err) {
    console.error("[Insignias][GET]", {
      message: err.message,
      stack: err.stack,
      code: err.code,
      method: req.method,
      time: new Date().toISOString()
    });
    const isDev = process.env.NODE_ENV !== 'production';
    res.status(500).json({
      error: 'Error al obtener insignias',
      details: isDev ? err.message : undefined
    });
  }
}