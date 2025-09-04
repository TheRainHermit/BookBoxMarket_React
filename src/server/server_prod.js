import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import swaggerUi from 'swagger-ui-express';
import swaggerSpecs from '../../swagger.js';
import rateLimit from 'express-rate-limit';
import pool from '../db/pg/pgPool.js';

// Configuración de Dotenv
dotenv.config();

// Configuración de Express
const app = express();
app.use(cors({
  origin: "/api",
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Configuración de Express Rate Limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // límite de 100 peticiones por ventana
});
app.use(limiter);

const ACCESS_SECRET = process.env.ACCESS_SECRET || "secreto";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "refresh_secreto";

// Middleware para verificar JWT
function authMiddleware(req, res, next) {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: "Acceso denegado" });

  try {
    const verified = jwt.verify(token, ACCESS_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    return res.status(400).json({ error: "Token inválido" });
  }
}

// Ruta de registro
app.post("/api/registro", async (req, res) => {
  const {
    nombre, apellido, email, password, telefono, direccion,
    ciudad, pais, codigo_postal, fecha_nto, preferencias_literarias
  } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  try {
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
    res.json({ user: userRows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error de servidor" });
  }
});

// Ruta de login
app.post("/api/login", async (req, res) => {
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
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    res.json({
      user: {
        id_usuario: user.id_usuario,
        email: user.email,
        nombre: user.nombre
      },
      token
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error de servidor" });
  }
});

// Endpoint de refresco de token
app.post("/api/refresh", async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).json({ error: "Refresh token requerido" });

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
    res.json({
      token: newToken,
      user: rows[0]
    });
  } catch (err) {
    console.error(err);
    return res.status(401).json({ error: "Refresh token inválido" });
  }
});

// Función para verificar y otorgar insignias a un usuario
async function verificarYOtorgarInsignias(id_usuario) {
  console.log(`Verificando insignias para usuario: ${id_usuario}`);

  // Estadísticas del usuario
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
    try {
      const { rows: tieneInsignia } = await pool.query(
        'SELECT 1 FROM insignias_usuario WHERE id_usuario = $1 AND id_insignia = $2',
        [id_usuario, insignia.id_insignia]
      );
      if (tieneInsignia.length > 0) continue;

      let cumpleCondicion = false;
      let razon = '';

      switch (insignia.id_insignia) {
        case 1: cumpleCondicion = totalCompras >= 1; razon = `Tiene ${totalCompras} compras (se requiere al menos 1)`; break;
        case 2: cumpleCondicion = totalDonaciones >= 1; razon = `Tiene ${totalDonaciones} donaciones (se requiere al menos 1)`; break;
        case 3: cumpleCondicion = totalCompras >= 5; razon = `Tiene ${totalCompras} compras (se requieren 5)`; break;
        case 4: cumpleCondicion = totalDonaciones >= 5; razon = `Tiene ${totalDonaciones} donaciones (se requieren 5)`; break;
        case 5: cumpleCondicion = totalCompras >= 20; razon = `Tiene ${totalCompras} compras (se requieren 20)`; break;
        case 6: cumpleCondicion = totalDonaciones >= 20; razon = `Tiene ${totalDonaciones} donaciones (se requieren 20)`; break;
        case 7: cumpleCondicion = totalCompras >= 50; razon = `Tiene ${totalCompras} compras (se requieren 50)`; break;
        case 8: cumpleCondicion = totalDonaciones >= 50; razon = `Tiene ${totalDonaciones} donaciones (se requieren 50)`; break;
        case 9: cumpleCondicion = totalGastado >= 1000; razon = `Ha gastado ${totalGastado}€ (se requieren 1000€)`; break;
      }

      if (cumpleCondicion) {
        await pool.query(
          'INSERT INTO insignias_usuario (id_usuario, id_insignia, fecha) VALUES ($1, $2, NOW())',
          [id_usuario, insignia.id_insignia]
        );
        insigniasOtorgadas.push(insignia);
      }
    } catch (error) {
      console.error(`Error al verificar insignia ${insignia.id_insignia}:`, error);
    }
  }
  return insigniasOtorgadas;
}

// Ruta de Donaciones
app.post("/api/donaciones", authMiddleware, async (req, res) => {
  const { libro_id, estado_donacion } = req.body;
  const usuario_id = req.user.id_usuario;

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
    }
    await client.query('COMMIT');
    res.json({
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
});

// Ruta de Compra
app.post("/api/compra", authMiddleware, async (req, res) => {
  const { fecha_compra, metodo_pago, productos } = req.body;
  const usuario_id = req.user.id_usuario;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: result } = await client.query(
      "INSERT INTO compra (usuario_id, fecha_compra, metodo_pago) VALUES ($1, $2, $3) RETURNING id_compra",
      [usuario_id, fecha_compra, metodo_pago]
    );
    const id_compra = result[0].id_compra;

    for (const producto of productos) {
      await client.query(
        "INSERT INTO d_compra (id_compra, id_caja, linia) VALUES ($1, $2, $3)",
        [id_compra, producto.id_caja, producto.linia || 1]
      );
    }
    const insigniasOtorgadas = await verificarYOtorgarInsignias(usuario_id);
    const { rows: usuarios } = await client.query(
      "SELECT nombre, email FROM users WHERE id_usuario = $1",
      [usuario_id]
    );
    const usuario = usuarios[0];
    try {
      await enviarEmail(
        usuario.email,
        "¡Gracias por tu compra!",
        `<h1>¡Hola ${usuario.nombre}!</h1><p>Tu compra fue exitosa...</p>`
      );
    } catch (err) {
      console.error("Error al enviar email de compra:", err);
    }
    await client.query('COMMIT');
    res.json({
      success: true,
      id_compra,
      insignias_otorgadas: insigniasOtorgadas,
      message: "¡Compra registrada!"
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error en el proceso de compra:", err);
    res.status(500).json({ error: "Error al registrar la compra" });
  } finally {
    client.release();
  }
});

// Ruta para verificar insignias
app.post('/api/insignias/verificar', authMiddleware, async (req, res) => {
  const { id_usuario } = req.body;
  try {
    const insigniasOtorgadas = await verificarYOtorgarInsignias(id_usuario);
    res.json({
      success: true,
      insignias_otorgadas: insigniasOtorgadas
    });
  } catch (error) {
    console.error('Error al verificar insignias:', error);
    res.status(500).json({
      success: false,
      error: 'Error al verificar insignias'
    });
  }
});

// Ruta para obtener insignias de un usuario
app.get('/api/insignias/usuario/:idUsuario', async (req, res) => {
  try {
    const { rows: insignias } = await pool.query(`
      SELECT i.*, iu.fecha 
      FROM insignias i
      JOIN insignias_usuario iu ON i.id_insignia = iu.id_insignia
      WHERE iu.id_usuario = $1
    `, [req.params.idUsuario]);
    res.json(insignias);
  } catch (error) {
    console.error('Error al obtener insignias del usuario:', error);
    res.status(500).json({ error: 'Error al obtener insignias del usuario' });
  }
});

// Ruta para obtener todas las insignias
app.get('/api/insignias', async (req, res) => {
  try {
    const { rows: insignias } = await pool.query('SELECT * FROM insignias');
    res.json(insignias);
  } catch (error) {
    console.error('Error al obtener insignias:', error);
    res.status(500).json({ error: 'Error al obtener insignias' });
  }
});

// Función para enviar emails
async function enviarEmail(destinatario, asunto, mensajeHtml) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: 'bryce21@ethereal.email',
      pass: 'JsdXHSFHXBgBVpBAf5'
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  try {
    const info = await transporter.sendMail({
      from: '"BookBox Market" <noreply@bookboxmarket.com>',
      to: destinatario,
      subject: asunto,
      html: mensajeHtml,
    });
    console.log('📧 Correo enviado con éxito!');
    console.log('📨 URL para previsualización:', nodemailer.getTestMessageUrl(info));
    return {
      success: true,
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info)
    };
  } catch (error) {
    console.error('❌ Error al enviar el correo:', error);
    throw new Error(`No se pudo enviar el correo: ${error.message}`);
  }
}

// Ruta para la documentación
app.use('/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpecs, { explorer: true })
);