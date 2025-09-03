import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_POOL_URL, // Usa la URL de Supabase
  ssl: { rejectUnauthorized: false }
});

export default pool;