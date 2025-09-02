import pool from '../src/db/pg/pgPool.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const ACCESS_SECRET = process.env.ACCESS_SECRET || "secreto";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "refresh_secreto";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { email, password } = req.body;

  try {
    const { rows } = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: "Usuario no encontrado" });
    }
    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }
    const token = jwt.sign(
      { id_usuario: user.id_usuario, email: user.email },
      ACCESS_SECRET,
      { expiresIn: "15m" }
    );
    const refreshToken = jwt.sign(
      { id_usuario: user.id_usuario, email: user.email },
      REFRESH_SECRET,
      { expiresIn: "7d" }
    );
    // Vercel serverless: No hay res.cookie, así que se puede devolver el refreshToken en el body o usar headers
    res.status(200).json({
      user: {
        id_usuario: user.id_usuario,
        email: user.email,
        nombre: user.nombre
      },
      token,
      refreshToken // El frontend debe guardar y enviar este token en futuras peticiones
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error de servidor" });
  }
}