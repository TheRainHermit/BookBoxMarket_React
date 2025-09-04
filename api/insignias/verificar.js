import pool from '../../src/db/pg/pgPool.js';

async function verificarYOtorgarInsignias(id_usuario) {
  const { rows: statsRows } = await pool.query(`
    SELECT 
      (SELECT COUNT(*) FROM compra WHERE usuario_id = $1) as totalCompras,
      COALESCE((
        SELECT SUM(c.precio)
        FROM d_compra dc
        JOIN cajas c ON dc.id_caja = c.id_caja
        JOIN compra co ON dc.id_compra = co.id_compra
        WHERE co.usuario_id = $1
      ), 0) as totalGastado,
      (SELECT COUNT(*) FROM donaciones WHERE usuario_id = $1) as totalDonaciones
  `, [id_usuario]);
  console.log("Stats rows: ", statsRows);
  const { totalcompras: totalCompras, totalgastado: totalGastado, totaldonaciones: totalDonaciones } = statsRows[0];

  const { rows: todasInsignias } = await pool.query('SELECT * FROM insignias');
  const insigniasOtorgadas = [];

  for (const insignia of todasInsignias) {
    const { rows: tieneInsignia } = await pool.query(
      'SELECT 1 FROM insignias_usuario WHERE id_usuario = $1 AND id_insignia = $2',
      [id_usuario, insignia.id_insignia]
    );
    if (tieneInsignia.length > 0) continue;

    let cumpleCondicion = false;
    switch (insignia.id_insignia) {
      case 1: cumpleCondicion = totalCompras >= 1; break;
      case 2: cumpleCondicion = totalDonaciones >= 1; break;
      case 3: cumpleCondicion = totalCompras >= 5; break;
      case 4: cumpleCondicion = totalDonaciones >= 5; break;
      case 5: cumpleCondicion = totalCompras >= 20; break;
      case 6: cumpleCondicion = totalDonaciones >= 20; break;
      case 7: cumpleCondicion = totalCompras >= 50; break;
      case 8: cumpleCondicion = totalDonaciones >= 50; break;
      case 9: cumpleCondicion = totalGastado >= 1000; break;
    }

    if (cumpleCondicion) {
      await pool.query(
        'INSERT INTO insignias_usuario (id_usuario, id_insignia, fecha) VALUES ($1, $2, NOW())',
        [id_usuario, insignia.id_insignia]
      );
      insigniasOtorgadas.push(insignia);
    }
  }
  return insigniasOtorgadas;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }
  const { id_usuario } = req.body;
  if (!id_usuario) {
    return res.status(400).json({ error: 'Falta id_usuario' });
  }
  try {
    const otorgadas = await verificarYOtorgarInsignias(id_usuario);
    res.status(200).json({ otorgadas });
  } catch (err) {
    console.error("[Insignias][Verificar][POST]", {
      message: err.message,
      stack: err.stack,
      code: err.code,
      params: req.body,
      time: new Date().toISOString()
    });
    const isDev = process.env.NODE_ENV !== 'production';
    res.status(500).json({
      error: 'Error al verificar/otorgar insignias',
      details: isDev ? err.message : undefined
    });
  }
}