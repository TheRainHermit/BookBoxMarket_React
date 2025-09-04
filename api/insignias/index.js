import pool from '../../src/db/pg/pgPool.js';

export default async function handler(req, res) {
  console.log("Req: ", req);
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }
  try {
    const { rows } = await pool.query('SELECT * FROM insignias');
    res.status(200).json(rows);
  } catch (err) {
    console.log("Error:", err);
    res.status(500).json({ error: 'Error al obtener insignias' });
  }
}