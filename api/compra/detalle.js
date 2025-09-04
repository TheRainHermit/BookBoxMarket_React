import pool from '../../src/db/pg/pgPool.js';
import jwt from 'jsonwebtoken';

function getUserFromRequest(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.split(' ')[1];
  if (!token) return null;
  try {
    const ACCESS_SECRET = process.env.ACCESS_SECRET || "secreto";
    return jwt.verify(token, ACCESS_SECRET);
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const user = getUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const { id_compra, productos } = req.body;
  if (!id_compra || !Array.isArray(productos)) {
    return res.status(400).json({ error: 'Faltan parámetros o productos no es un array' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const producto of productos) {
      if (!producto.id_caja || !producto.linia) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Producto sin id_caja o linia' });
      }
      await client.query(
        "INSERT INTO d_compra (id_compra, id_caja, linia) VALUES ($1, $2, $3)",
        [id_compra, producto.id_caja, producto.linia]
      );
    }
    await client.query('COMMIT');
    res.status(200).json({ success: true, message: "Detalle de compra registrado" });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error en detalle de compra:", err);
    res.status(500).json({ error: "Error al registrar el detalle de la compra" });
  } finally {
    client.release();
  }
}