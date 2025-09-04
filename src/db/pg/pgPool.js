import pkg from 'pg';
const { Pool } = pkg;

// Usa el string de pool de conexiones de Supabase (puerto 6543)
// Ejemplo de variable de entorno recomendada:
// SUPABASE_DB_POOL_URL=postgresql://postgres.jtdoyaunoxhowhemykvy:Mizane211294@aws-1-us-east-1.pooler.supabase.com:6543/postgres

let pool;

try {
  pool = new Pool({
    connectionString: process.env.SUPABASE_DB_POOL_URL,
    ssl: { rejectUnauthorized: false }
  });

  // Prueba de conexión inicial para detectar errores de configuración al arrancar
  pool.query('SELECT 1')
    .then(() => {
      console.info('[pgPool] Conexión a Supabase exitosa');
    })
    .catch((err) => {
      console.error('[pgPool] Error inicial al conectar a Supabase:', {
        connectionString: process.env.SUPABASE_DB_POOL_URL,
        message: err.message,
        stack: err.stack
      });
    });
} catch (err) {
  // Esto captura errores de construcción del pool, no de queries
  console.error('[pgPool] Error al crear el pool de conexiones:', {
    connectionString: process.env.SUPABASE_DB_POOL_URL,
    message: err.message,
    stack: err.stack
  });
  throw err;
}

export default pool;