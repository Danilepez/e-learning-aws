import { query } from '../config/database.js';

class Progress {
  // Actualizar o crear progreso de un módulo
  static async upsert(studentId, moduleId, data) {
    const { watchedSeconds, lastPosition, completed } = data;

    const result = await query(`
      INSERT INTO progress (student_id, module_id, watched_seconds, last_position, completed, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      ON CONFLICT (student_id, module_id)
      DO UPDATE SET
        watched_seconds = GREATEST(progress.watched_seconds, $3),
        last_position = $4,
        completed = $5,
        updated_at = NOW()
      RETURNING *
    `, [studentId, moduleId, watchedSeconds, lastPosition, completed]);

    return result.rows[0];
  }

  // Obtener progreso de un estudiante en un módulo
  static async find(studentId, moduleId) {
    const result = await query(
      'SELECT * FROM progress WHERE student_id = $1 AND module_id = $2',
      [studentId, moduleId]
    );
    return result.rows[0];
  }

  // Obtener todo el progreso de un estudiante
  static async findByStudent(studentId) {
    const result = await query(`
      SELECT 
        p.*,
        m.title as module_title,
        m.course_id
      FROM progress p
      JOIN modules m ON p.module_id = m.id
      WHERE p.student_id = $1
      ORDER BY p.updated_at DESC
    `, [studentId]);
    return result.rows;
  }

  // Marcar módulo como completado
  static async markCompleted(studentId, moduleId) {
    const result = await query(`
      UPDATE progress 
      SET completed = TRUE, updated_at = NOW()
      WHERE student_id = $1 AND module_id = $2
      RETURNING *
    `, [studentId, moduleId]);
    return result.rows[0];
  }

  // Estadísticas generales
  static async getStats(studentId) {
    const result = await query(`
      SELECT 
        COUNT(*) as total_courses,
        COUNT(*) FILTER (WHERE completed = true) as completed_courses,
        SUM(watched_seconds) as total_watched_seconds
      FROM progress
      WHERE student_id = $1
    `, [studentId]);
    return result.rows[0];
  }
}

export default Progress;
