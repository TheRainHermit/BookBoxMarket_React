import pool from '../../src/db/pg/pgPool.js';

export default async function handler(req, res) {
  console.log("Req: ", req);
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }
  const { id_usuario } = req.query;
  console.log("Id usuario: ", id_usuario);
  if (!id_usuario) {
    return res.status(400).json({ error: 'Falta id_usuario' });
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
    console.log("Error:", err);
    res.status(500).json({ error: 'Error al obtener insignias del usuario' });
  }
}