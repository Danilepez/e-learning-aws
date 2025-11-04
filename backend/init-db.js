import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Client } = pg;

async function initDatabase() {
  console.log('🚀 Iniciando configuración de base de datos...\n');

  // Paso 1: Conectar a la base de datos 'postgres' (siempre existe)
  const adminClient = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: 'postgres', // Base de datos por defecto
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    console.log('📡 Conectando a PostgreSQL (base: postgres)...');
    await adminClient.connect();
    console.log('✅ Conectado a PostgreSQL\n');

    // Paso 2: Verificar si la base de datos existe
    const dbName = process.env.DB_NAME;
    const checkDbQuery = `SELECT 1 FROM pg_database WHERE datname = $1`;
    const result = await adminClient.query(checkDbQuery, [dbName]);

    if (result.rows.length === 0) {
      console.log(`📦 Creando base de datos "${dbName}"...`);
      await adminClient.query(`CREATE DATABASE "${dbName}"`);
      console.log('✅ Base de datos creada\n');
    } else {
      console.log(`ℹ️  Base de datos "${dbName}" ya existe\n`);
    }

    await adminClient.end();

    // Paso 3: Conectar a la nueva base de datos y ejecutar el schema
    console.log(`📡 Conectando a base de datos "${dbName}"...`);
    const appClient = new Client({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: dbName,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      ssl: {
        rejectUnauthorized: false,
      },
    });

    await appClient.connect();
    console.log('✅ Conectado\n');

    // Paso 4: Ejecutar schema.sql
    console.log('📋 Ejecutando schema.sql...');
    const schemaPath = path.join(__dirname, 'src', 'config', 'schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf-8');

    // Dividir por punto y coma y ejecutar cada statement
    const statements = schemaSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    for (const statement of statements) {
      try {
        await appClient.query(statement);
      } catch (error) {
        // Ignorar errores de "ya existe"
        if (!error.message.includes('already exists')) {
          console.error(`⚠️  Error en statement: ${error.message}`);
        }
      }
    }

    console.log('✅ Schema ejecutado correctamente\n');

    // Paso 5: Verificar tablas creadas
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    const tables = await appClient.query(tablesQuery);
    console.log('📊 Tablas creadas:');
    tables.rows.forEach(row => {
      console.log(`   ✓ ${row.table_name}`);
    });
    console.log('');

    // Paso 6: Verificar usuarios demo
    const usersQuery = 'SELECT id, name, email, role FROM users';
    const users = await appClient.query(usersQuery);
    console.log('👥 Usuarios demo:');
    users.rows.forEach(user => {
      console.log(`   ✓ ${user.email} (${user.role})`);
    });
    console.log('');

    await appClient.end();

    console.log('🎉 ¡Base de datos inicializada correctamente!\n');
    console.log('✅ Ahora puedes ejecutar: npm run dev');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\n💡 Tip: Verifica las credenciales en .env');
    process.exit(1);
  }
}

initDatabase();
