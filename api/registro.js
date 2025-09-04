import pool from '../src/db/pg/pgPool.js';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  console.log("Req: ", req);
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const {
    nombre, apellido, email, password, telefono, direccion,
    ciudad, pais, codigo_postal, fecha_nto, preferencias_literarias
  } = req.body;
  console.log("Body: ", req.body);

  try {
    const hashed = await bcrypt.hash(password, 10);

    const { rows: existing } = await pool.query(
      "SELECT 1 FROM users WHERE email = $1",
      [email]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: "Usuario ya existe" });
    }

    await pool.query(
      `INSERT INTO users
        (nombre, apellido, email, password, telefono, direccion, ciudad, pais, codigo_postal, fecha_nto, preferencias_literarias)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        nombre, apellido, email, hashed, telefono, direccion,
        ciudad, pais, codigo_postal, fecha_nto, preferencias_literarias
      ]
    );

    const { rows: userRows } = await pool.query(
      "SELECT id_usuario, nombre, email FROM users WHERE email = $1",
      [email]
    );

    res.status(200).json({ user: userRows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error de servidor" });
  }
}