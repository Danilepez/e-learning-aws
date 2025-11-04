import { query } from '../config/database.js';
import bcrypt from 'bcryptjs';

class User {
  // Crear usuario
  static async create({ name, email, password, role }) {
    const passwordHash = await bcrypt.hash(password, 10);
    
    const result = await query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at',
      [name, email, passwordHash, role]
    );
    
    return result.rows[0];
  }

  // Buscar por email
  static async findByEmail(email) {
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  }

  // Buscar por ID
  static async findById(id) {
    const result = await query(
      'SELECT id, name, email, role, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  // Obtener todos los usuarios
  static async findAll() {
    const result = await query(
      'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
    );
    return result.rows;
  }

  // Actualizar usuario
  static async update(id, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (updates.name) {
      fields.push(`name = $${paramCount}`);
      values.push(updates.name);
      paramCount++;
    }

    if (updates.email) {
      fields.push(`email = $${paramCount}`);
      values.push(updates.email);
      paramCount++;
    }

    if (updates.password) {
      const passwordHash = await bcrypt.hash(updates.password, 10);
      fields.push(`password_hash = $${paramCount}`);
      values.push(passwordHash);
      paramCount++;
    }

    if (updates.role) {
      fields.push(`role = $${paramCount}`);
      values.push(updates.role);
      paramCount++;
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING id, name, email, role, updated_at`,
      values
    );

    return result.rows[0];
  }

  // Eliminar usuario
  static async delete(id) {
    const result = await query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rows[0];
  }

  // Verificar contraseña
  static async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  // Estadísticas por rol
  static async getStatsByRole() {
    const result = await query(`
      SELECT 
        role,
        COUNT(*) as count
      FROM users
      GROUP BY role
    `);
    return result.rows;
  }
}

export default User;
