import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_POOL_URL,
  ssl: { rejectUnauthorized: false }
});

export default pool;