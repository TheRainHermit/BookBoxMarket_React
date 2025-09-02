import pool from '../src/db/pg/pgPool.js';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

// Helper para verificar JWT
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

// Función para verificar y otorgar insignias
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

// Función para enviar emails
async function enviarEmail(destinatario, asunto, mensajeHtml) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER, // Tu correo de Gmail
            pass: process.env.GMAIL_PASS, // Contraseña de aplicación (no la normal)
        }
    });

    try {
        const info = await transporter.sendMail({
            from: `"BookBox Market" <${process.env.GMAIL_USER}>`,
            to: destinatario,
            subject: asunto,
            html: mensajeHtml,
        });
        console.log('📧 Correo enviado con éxito!');
        return {
            success: true,
            messageId: info.messageId,
        };
    } catch (error) {
        console.error('❌ Error al enviar el correo:', error);
        throw new Error(`No se pudo enviar el correo: ${error.message}`);
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
  const usuario_id = user.id_usuario;
  const { libro_id, estado_donacion } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      "INSERT INTO donaciones (usuario_id, libro_id, fecha_donacion, estado_donacion) VALUES ($1, $2, CURRENT_DATE, $3)",
      [usuario_id, libro_id, estado_donacion]
    );
    await client.query(
      `INSERT INTO puntos_usuario (id_usuario, puntos) VALUES ($1, 10)
       ON CONFLICT (id_usuario) DO UPDATE SET puntos = puntos_usuario.puntos + 10`,
      [usuario_id]
    );
    const insigniasOtorgadas = await verificarYOtorgarInsignias(usuario_id);

    // Envío de email de agradecimiento
    const { rows: usuarios } = await client.query(
      "SELECT nombre, email FROM users WHERE id_usuario = $1",
      [usuario_id]
    );
    const usuario = usuarios[0];
    try {
      await enviarEmail(
        usuario.email,
        "¡Gracias por tu donación!",
        `<h1>¡Hola ${usuario.nombre}!</h1><p>Tu donación fue exitosa...</p>`
      );
    } catch (err) {
      console.error("Error al enviar email de donación:", err);
      // El error de email no cancela la transacción
    }

    await client.query('COMMIT');
    res.status(200).json({
      success: true,
      insignias_otorgadas: insigniasOtorgadas,
      message: "¡Donación registrada!"
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error al registrar donación:", err);
    res.status(500).json({ error: "Error al registrar la donación" });
  } finally {
    client.release();
  }
}