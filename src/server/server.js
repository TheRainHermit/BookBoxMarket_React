import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import swaggerUi from 'swagger-ui-express';
import swaggerSpecs from '../../swagger.js';
import rateLimit from 'express-rate-limit';

// Configuración de Dotenv
dotenv.config();

// Configuración de Express
const app = express();
app.use(cors({
  origin: "http://localhost:5173",
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
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "",
  database: "bookboxmarket"
};

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

/**
 * @swagger
 * /api/registro:
 *   post:
 *     summary: Registra un nuevo usuario
 *     tags: [Autenticación]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Usuario'
 *     responses:
 *       200:
 *         description: Usuario registrado exitosamente
 *       400:
 *         description: Error en los datos proporcionados
 */
// Ruta de registro
app.post("/api/registro", async (req, res) => {
  const {
    nombre,
    apellido,
    email,
    password,
    telefono,
    direccion,
    ciudad,
    pais,
    codigo_postal,
    fecha_nto,
    preferencias_literarias
  } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length > 0) {
      await conn.end();
      return res.status(400).json({ error: "Usuario ya existe" });
    }
    await conn.execute(
      `INSERT INTO users 
        (nombre, apellido, email, password, telefono, direccion, ciudad, pais, codigo_postal, fecha_nto, preferencias_literarias)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        nombre,
        apellido,
        email,
        hashed,
        telefono,
        direccion,
        ciudad,
        pais,
        codigo_postal,
        fecha_nto,
        preferencias_literarias
      ]
    );
    const [userRows] = await conn.execute("SELECT id_usuario, nombre, email FROM users WHERE email = ?", [email]);
    await conn.end();
    res.json({ user: userRows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error de servidor" });
  }
});

// Ruta de login
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("Intento de login para:", email);
  let conn;
  try {
    conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute("SELECT * FROM users WHERE email = ?", [email]);
    console.log("Usuario encontrado en BD:", rows[0] ? "Sí" : "No");
    
    if (rows.length === 0) {
      console.log("Usuario no encontrado");
      return res.status(401).json({ error: "Usuario no encontrado" });
    }

    const user = rows[0];
    console.log("Comparando contraseña...");
    const valid = await bcrypt.compare(password, user.password);
    console.log("Contraseña correcta");

    if (!valid) {
      console.log("Contraseña incorrecta");
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    console.log("Login exitoso, generando tokens...");

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
  } finally {
    if (conn) await conn.end();
  }
});

// Endpoint de refresco de token
app.post("/api/refresh", async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) return res.status(401).json({ error: "Refresh token requerido" });

  try {
    const user = jwt.verify(refreshToken, REFRESH_SECRET);
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute(
      "SELECT id_usuario, nombre, email FROM users WHERE id_usuario = ?", 
      [user.id_usuario]
    );
    await conn.end();
    
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
async function verificarYOtorgarInsignias(id_usuario, conn) {
  console.log(`Verificando insignias para usuario: ${id_usuario}`);
  
  const [stats] = await conn.execute(`
    SELECT 
      (SELECT COUNT(*) FROM compra WHERE usuario_id = ?) as totalCompras,
      COALESCE((
        SELECT SUM(c.precio)
        FROM d_compra dc
        JOIN cajas c ON dc.id_caja = c.id_caja
        JOIN compra co ON dc.id_compra = co.id_compra
        WHERE co.usuario_id = ?
      ), 0) as totalGastado,
      (SELECT COUNT(*) FROM donaciones WHERE usuario_id = ?) as totalDonaciones
  `, [id_usuario, id_usuario, id_usuario]);

  console.log(`Estadísticas para usuario ${id_usuario}:`, stats[0]);
  const { totalCompras, totalGastado, totalDonaciones } = stats[0];

  const [todasInsignias] = await conn.execute('SELECT * FROM insignias');
  const insigniasOtorgadas = [];

  for (const insignia of todasInsignias) {
    try {
      const [tieneInsignia] = await conn.execute(
        'SELECT 1 FROM insignias_usuario WHERE id_usuario = ? AND id_insignia = ?',
        [id_usuario, insignia.id_insignia]
      );

      if (tieneInsignia.length > 0) {
        console.log(`Usuario ${id_usuario} ya tiene la insignia ${insignia.id_insignia}`);
        continue;
      }

      let cumpleCondicion = false;
      let razon = '';

      switch (insignia.id_insignia) {
        case 1: // Primera compra
          cumpleCondicion = totalCompras >= 1;
          razon = `Tiene ${totalCompras} compras (se requiere al menos 1)`;
          break;
        case 2: // Primera donación
          cumpleCondicion = totalDonaciones >= 1;
          razon = `Tiene ${totalDonaciones} donaciones (se requiere al menos 1)`;
          break;
        case 3: // Comprador frecuente (5 compras)
          cumpleCondicion = totalCompras >= 5;
          razon = `Tiene ${totalCompras} compras (se requieren 5)`;
          break;
        case 4: // Donador frecuente (5 donaciones)
          cumpleCondicion = totalDonaciones >= 5;
          razon = `Tiene ${totalDonaciones} donaciones (se requieren 5)`;
          break;
        case 5: // Comprador ávido (20 compras)
          cumpleCondicion = totalCompras >= 20;
          razon = `Tiene ${totalCompras} compras (se requieren 20)`;
          break;
        case 6: // Donador ávido (20 donaciones)
          cumpleCondicion = totalDonaciones >= 20;
          razon = `Tiene ${totalDonaciones} donaciones (se requieren 20)`;
          break;
        case 7: // Comprador experto (50 compras)
          cumpleCondicion = totalCompras >= 50;
          razon = `Tiene ${totalCompras} compras (se requieren 50)`;
          break;
        case 8: // Donador experto (50 donaciones)
          cumpleCondicion = totalDonaciones >= 50;
          razon = `Tiene ${totalDonaciones} donaciones (se requieren 50)`;
          break;
        case 9: // Gran gastador (1000€)
          cumpleCondicion = totalGastado >= 1000;
          razon = `Ha gastado ${totalGastado}€ (se requieren 1000€)`;
          break;
      }

      if (cumpleCondicion) {
        await conn.execute(
          'INSERT INTO insignias_usuario (id_usuario, id_insignia, fecha_obtencion) VALUES (?, ?, NOW())',
          [id_usuario, insignia.id_insignia]
        );
        console.log(`Insignia ${insignia.nombre} otorgada al usuario ${id_usuario}: ${razon}`);
        insigniasOtorgadas.push(insignia);
      } else {
        console.log(`El usuario ${id_usuario} no cumple para ${insignia.nombre}: ${razon}`);
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
  const conn = await mysql.createConnection(dbConfig);

  try {
    await conn.beginTransaction();

    // 1. Registrar la donación
    await conn.execute(
      "INSERT INTO donaciones (usuario_id, libro_id, fecha_donacion, estado_donacion) VALUES (?, ?, CURDATE(), ?)",
      [usuario_id, libro_id, estado_donacion]
    );

    // 2. Actualizar puntos del usuario
    await conn.execute(
      "INSERT INTO puntos_usuario (id_usuario, puntos) VALUES (?, 10) ON DUPLICATE KEY UPDATE puntos = puntos + 10",
      [usuario_id]
    );

    // 3. Verificar y otorgar insignias
    const insigniasOtorgadas = await verificarYOtorgarInsignias(usuario_id, conn);

    // 4. Obtener datos del usuario para el email
    const [usuarios] = await conn.execute(
      "SELECT nombre, email FROM users WHERE id_usuario = ?",
      [usuario_id]
    );
    const usuario = usuarios[0];

    // 5. Enviar email de confirmación
    try {
      await enviarEmail(
        usuario.email,
        "¡Gracias por tu donación!",
        `<h1>¡Hola ${usuario.nombre}!</h1><p>Tu donación fue exitosa...</p>`
      );
    } catch (err) {
      console.error("Error al enviar email de donación:", err);
    }

    await conn.commit();
    res.json({ 
      success: true, 
      insignias_otorgadas: insigniasOtorgadas,
      message: "¡Donación registrada!" 
    });
  } catch (err) {
    await conn.rollback();
    console.error("Error al registrar donación:", err);
    res.status(500).json({ error: "Error al registrar la donación" });
  } finally {
    await conn.end();
  }
});

// Ruta de Compra
app.post("/api/compra", authMiddleware, async (req, res) => {
  const { fecha_compra, metodo_pago, productos } = req.body;
  const usuario_id = req.user.id_usuario;
  const conn = await mysql.createConnection(dbConfig);

  try {
    await conn.beginTransaction();

    // 1. Registrar la compra
    const [result] = await conn.execute(
      "INSERT INTO compra (usuario_id, fecha_compra, metodo_pago) VALUES (?, ?, ?)",
      [usuario_id, fecha_compra, metodo_pago]
    );
    const id_compra = result.insertId;

    // 2. Registrar detalles de la compra
    for (const producto of productos) {
      await conn.execute(
        "INSERT INTO d_compra (id_compra, id_caja, linia) VALUES (?, ?, ?)",
        [id_compra, producto.id_caja, producto.linia || 1]
      );
    }

    // 3. Verificar y otorgar insignias
    const insigniasOtorgadas = await verificarYOtorgarInsignias(usuario_id, conn);

    // 4. Obtener datos del usuario para el email
    const [usuarios] = await conn.execute(
      "SELECT nombre, email FROM users WHERE id_usuario = ?",
      [usuario_id]
    );
    const usuario = usuarios[0];

    // 5. Enviar email de confirmación
    try {
      await enviarEmail(
        usuario.email,
        "¡Gracias por tu compra!",
        `<h1>¡Hola ${usuario.nombre}!</h1><p>Tu compra fue exitosa...</p>`
      );
    } catch (err) {
      console.error("Error al enviar email de compra:", err);
    }

    await conn.commit();
    res.json({ 
      success: true, 
      id_compra,
      insignias_otorgadas: insigniasOtorgadas,
      message: "¡Compra registrada!" 
    });
  } catch (err) {
    await conn.rollback();
    console.error("Error en el proceso de compra:", err);
    res.status(500).json({ error: "Error al registrar la compra" });
  } finally {
    await conn.end();
  }
});

// Ruta para verificar insignias
app.post('/api/insignias/verificar', authMiddleware, async (req, res) => {
  const { id_usuario } = req.body;
  const conn = await mysql.createConnection(dbConfig);

  try {
    const insigniasOtorgadas = await verificarYOtorgarInsignias(id_usuario, conn);
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
  } finally {
    await conn.end();
  }
});

// Ruta para obtener insignias de un usuario
app.get('/api/insignias/usuario/:idUsuario', async (req, res) => {
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [insignias] = await conn.execute(`
      SELECT i.*, iu.fecha_obtencion 
      FROM insignias i
      JOIN insignias_usuario iu ON i.id_insignia = iu.id_insignia
      WHERE iu.id_usuario = ?
    `, [req.params.idUsuario]);
    await conn.end();
    res.json(insignias);
  } catch (error) {
    console.error('Error al obtener insignias del usuario:', error);
    res.status(500).json({ error: 'Error al obtener insignias del usuario' });
  }
});

// Ruta para obtener todas las insignias
app.get('/api/insignias', async (req, res) => {
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [insignias] = await conn.execute('SELECT * FROM insignias');
    await conn.end();
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

// Inicia el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend corriendo en http://localhost:${PORT}`));