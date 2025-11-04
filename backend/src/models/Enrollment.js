import { query } from '../config/database.js';

class Enrollment {
  // Inscribir estudiante en un curso
  static async create(studentId, courseId) {
    const result = await query(
      'INSERT INTO enrollments (student_id, course_id) VALUES ($1, $2) RETURNING *',
      [studentId, courseId]
    );
    return result.rows[0];
  }

  // Obtener todas las inscripciones
  static async findAll() {
    const result = await query(
      'SELECT * FROM enrollments ORDER BY enrolled_at DESC'
    );
    return result.rows;
  }

  // Obtener inscripciones de un estudiante
  static async findByStudent(studentId) {
    const result = await query(
      'SELECT e.*, c.title as course_title FROM enrollments e JOIN courses c ON e.course_id = c.id WHERE e.student_id = $1 ORDER BY e.enrolled_at DESC',
      [studentId]
    );
    return result.rows;
  }

  // Obtener inscripciones de un curso
  static async findByCourse(courseId) {
    const result = await query(
      'SELECT e.*, u.name as student_name, u.email as student_email FROM enrollments e JOIN users u ON e.student_id = u.id WHERE e.course_id = $1',
      [courseId]
    );
    return result.rows;
  }

  // Verificar si un estudiante está inscrito
  static async isEnrolled(studentId, courseId) {
    const result = await query(
      'SELECT * FROM enrollments WHERE student_id = $1 AND course_id = $2',
      [studentId, courseId]
    );
    return result.rows.length > 0;
  }

  // Eliminar inscripción
  static async delete(studentId, courseId) {
    const result = await query(
      'DELETE FROM enrollments WHERE student_id = $1 AND course_id = $2 RETURNING *',
      [studentId, courseId]
    );
    return result.rows[0];
  }
}

export default Enrollment;
