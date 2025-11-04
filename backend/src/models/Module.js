import pool from '../config/database.js';

class Module {
  // Crear módulo
  static async create({ courseId, title, description, videoFilename, orderIndex }) {
    const query = `
      INSERT INTO modules (course_id, title, description, video_filename, order_index)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [courseId, title, description, videoFilename, orderIndex];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Obtener todos los módulos de un curso
  static async findByCourse(courseId) {
    const query = `
      SELECT * FROM modules
      WHERE course_id = $1
      ORDER BY order_index ASC
    `;
    const result = await pool.query(query, [courseId]);
    return result.rows;
  }

  // Obtener módulo por ID
  static async findById(id) {
    const query = 'SELECT * FROM modules WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Actualizar módulo
  static async update(id, { title, description, videoFilename, orderIndex }) {
    const query = `
      UPDATE modules
      SET title = COALESCE($1, title),
          description = COALESCE($2, description),
          video_filename = COALESCE($3, video_filename),
          order_index = COALESCE($4, order_index),
          updated_at = NOW()
      WHERE id = $5
      RETURNING *
    `;
    const values = [title, description, videoFilename, orderIndex, id];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Eliminar módulo
  static async delete(id) {
    const query = 'DELETE FROM modules WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Obtener duración total de un curso
  static async getTotalDuration(courseId) {
    const query = `
      SELECT COALESCE(SUM(duration), 0) as total_duration
      FROM modules
      WHERE course_id = $1
    `;
    const result = await pool.query(query, [courseId]);
    return result.rows[0].total_duration;
  }

  // Contar módulos de un curso
  static async countByCourse(courseId) {
    const query = 'SELECT COUNT(*) FROM modules WHERE course_id = $1';
    const result = await pool.query(query, [courseId]);
    return parseInt(result.rows[0].count);
  }
}

export default Module;
