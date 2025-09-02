import pool from '../src/db/pg/pgPool.js';
import jwt from 'jsonwebtoken';

const ACCESS_SECRET = process.env.ACCESS_SECRET || "secreto";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "refresh_secreto";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  // El refreshToken debe venir en el body o en headers, ya que no hay cookies automáticas en serverless
  const refreshToken = req.body.refreshToken || req.headers['x-refresh-token'];
  if (!refreshToken) {
    return res.status(401).json({ error: "Refresh token requerido" });
  }

  try {
    const user = jwt.verify(refreshToken, REFRESH_SECRET);
    const { rows } = await pool.query(
      "SELECT id_usuario, nombre, email FROM users WHERE id_usuario = $1",
      [user.id_usuario]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }
    const newToken = jwt.sign(
      { id_usuario: user.id_usuario, email: user.email },
      ACCESS_SECRET,
      { expiresIn: "15m" }
    );
    res.status(200).json({
      token: newToken,
      user: rows[0]
    });
  } catch (err) {
    console.error(err);
    return res.status(401).json({ error: "Refresh token inválido" });
  }
}