import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './src/config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrate() {
  try {
    console.log('🔄 Iniciando migración de base de datos...\n');

    // Leer el archivo SQL
    const sqlFile = path.join(__dirname, 'migrate-modules.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // Ejecutar la migración
    await pool.query(sql);

    console.log('✅ Migración completada exitosamente');
    console.log('\n📊 Nuevas tablas:');
    console.log('   - modules (nueva tabla para módulos de cursos)');
    console.log('   - progress (actualizada para referenciar módulos)');
    console.log('\n⚠️  Se eliminaron los cursos de demo antiguos (1-5)');
    console.log('   Ahora debes crear cursos nuevos y agregarles módulos\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error en la migración:', error.message);
    console.error(error);
    process.exit(1);
  }
}

migrate();
