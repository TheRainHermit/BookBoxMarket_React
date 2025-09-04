import pool from '../../src/db/pg/pgPool.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }
  const { id_usuario } = req.query;
  if (!id_usuario || typeof id_usuario !== 'string') {
    return res.status(400).json({ error: 'Parámetro id_usuario inválido' });
  }
  try {
    const { rows } = await pool.query(
      `SELECT i.* FROM insignias_usuario iu
       JOIN insignias i ON iu.id_insignia = i.id_insignia
       WHERE iu.id_usuario = $1`,
      [id_usuario]
    );
    res.status(200).json(rows);
  } catch (err) {
    console.error("[Insignias][Usuario][GET]", {
      message: err.message,
      stack: err.stack,
      code: err.code,
      params: req.query,
      time: new Date().toISOString()
    });
    const isDev = process.env.NODE_ENV !== 'production';
    res.status(500).json({
      error: 'Error al obtener insignias del usuario',
      details: isDev ? err.message : undefined
    });
  }
}