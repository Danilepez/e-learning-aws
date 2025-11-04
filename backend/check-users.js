import pool from './src/config/database.js';

async function checkUsers() {
  try {
    const result = await pool.query('SELECT id, name, email, role FROM users ORDER BY id');
    console.log('\n👥 Usuarios en la base de datos:');
    console.log('================================\n');
    
    if (result.rows.length === 0) {
      console.log('❌ No hay usuarios en la base de datos');
    } else {
      result.rows.forEach(user => {
        console.log(`ID: ${user.id}`);
        console.log(`Nombre: ${user.name}`);
        console.log(`Email: ${user.email}`);
        console.log(`Rol: ${user.role}`);
        console.log('--------------------------------');
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkUsers();
