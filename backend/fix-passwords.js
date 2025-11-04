import pg from 'pg';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function fixPasswords() {
  try {
    console.log('🔐 Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conectado exitosamente\n');

    // Generar nuevo hash para "password123"
    const password = 'password123';
    const newHash = await bcrypt.hash(password, 10);
    console.log(`🔑 Nuevo hash generado para password: "${password}"`);
    console.log(`   Hash: ${newHash}\n`);

    // Actualizar todos los usuarios demo
    const users = [
      { email: 'admin@elearning.com', role: 'admin' },
      { email: 'teacher@elearning.com', role: 'teacher' },
      { email: 'student@elearning.com', role: 'student' }
    ];

    console.log('📝 Actualizando contraseñas...\n');
    
    for (const user of users) {
      const result = await client.query(
        'UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING id, email, role',
        [newHash, user.email]
      );
      
      if (result.rows.length > 0) {
        console.log(`✅ ${user.email} (${user.role}) - contraseña actualizada`);
        
        // Verificar que funciona
        const testResult = await client.query(
          'SELECT password_hash FROM users WHERE email = $1',
          [user.email]
        );
        const isValid = await bcrypt.compare(password, testResult.rows[0].password_hash);
        console.log(`   Verificación: ${isValid ? '✅ OK' : '❌ ERROR'}`);
      } else {
        console.log(`⚠️  Usuario ${user.email} no encontrado`);
      }
    }

    console.log('\n🎉 ¡Contraseñas actualizadas correctamente!');
    console.log('\n📋 Puedes iniciar sesión con:');
    console.log('   Email: admin@elearning.com / teacher@elearning.com / student@elearning.com');
    console.log('   Password: password123');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

fixPasswords();
