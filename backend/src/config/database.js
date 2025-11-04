import pg from 'pg';
import config from './config.js';

const { Pool } = pg;

// Pool de conexiones a PostgreSQL
const pool = new Pool({
  host: config.database.host,
  port: config.database.port,
  database: config.database.database,
  user: config.database.user,
  password: config.database.password,
  max: 20, // Máximo de conexiones simultáneas
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  // SSL requerido para AWS RDS
  ssl: {
    rejectUnauthorized: false, // Para desarrollo, acepta cualquier certificado
  },
});

// Manejar errores de conexión
pool.on('error', (err) => {
  console.error('❌ Error inesperado en el pool de PostgreSQL:', err);
  process.exit(-1);
});

// Función para verificar conexión
export const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✅ Conexión a PostgreSQL exitosa:', result.rows[0].now);
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Error al conectar a PostgreSQL:', error.message);
    return false;
  }
};

// Función helper para queries
export const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    // Solo log si la query es muy lenta (> 1 segundo)
    if (duration > 1000) {
      console.log(`⚠️ Query lenta: ${duration}ms`);
    }
    return result;
  } catch (error) {
    console.error('❌ Error en query:', error);
    throw error;
  }
};

export default pool;
