import pool from '../src/db/pg/pgPool.js';
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

  const { titulo, autor, genero, estado } = req.body;
  if (!titulo || !autor || !genero || !estado) {
    return res.status(400).json({ error: 'Faltan datos del libro' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO libros (titulo, autor, genero, estado) VALUES ($1, $2, $3, $4) RETURNING id_libro',
      [titulo, autor, genero, estado]
    );
    res.status(200).json({ id_libro: result.rows[0].id_libro });
  } catch (err) {
    console.error("Error al registrar libro:", err);
    res.status(500).json({ error: "Error al registrar el libro" });
  }
}