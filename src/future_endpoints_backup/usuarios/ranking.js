// import pool from '../../src/db/pg/pgPool.js';

// export default async function handler(req, res) {
//   if (req.method !== 'GET') {
//     return res.status(405).json({ error: 'Método no permitido' });
//   }

//   try {
//     // Obtener todos los usuarios ordenados por puntos (ajusta los nombres de columnas y tabla según tu base)
//     const { rows } = await pool.query(
//         `SELECT 
//             u.id_usuario AS id, 
//             u.nombre, 
//             u.email, 
//             COALESCE(pu.puntos, 0) AS puntos,
//             FLOOR(COALESCE(pu.puntos, 0) / 100) + 1 AS nivel
//          FROM users u
//          LEFT JOIN puntos_usuario pu ON u.id_usuario = pu.id_usuario
//          ORDER BY puntos DESC, nombre ASC
//          LIMIT 100`
//       );

//     // Determinar usuario actual (opcional, si usas autenticación por token)
//     let posicionUsuarioActual = null;
//     let idUsuarioActual = null;
//     // Si usas JWT, extrae el id_usuario del token aquí (ejemplo básico):
//     const auth = req.headers.authorization;
//     if (auth && auth.startsWith('Bearer ')) {
//       // Decodifica tu JWT aquí y extrae el id_usuario
//       // idUsuarioActual = ...
//     }

//     const ranking = rows.map((usuario, idx) => {
//       const esActual = idUsuarioActual && usuario.id === idUsuarioActual;
//       if (esActual) posicionUsuarioActual = idx + 1;
//       return { ...usuario, esActual };
//     });

//     res.status(200).json({
//       ranking,
//       posicionUsuarioActual
//     });
//   } catch (err) {
//     console.error("[Usuarios][Ranking][GET]", {
//       message: err.message,
//       stack: err.stack,
//       code: err.code,
//       time: new Date().toISOString()
//     });
//     res.status(500).json({ error: 'Error al obtener ranking de usuarios' });
//   }
// }