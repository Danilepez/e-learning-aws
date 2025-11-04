import { query } from '../config/database.js';

class Course {
  // Crear curso
  static async create({ title, description, teacherId }) {
    const result = await query(
      'INSERT INTO courses (title, description, teacher_id) VALUES ($1, $2, $3) RETURNING *',
      [title, description, teacherId]
    );
    return result.rows[0];
  }

  // Obtener todos los cursos
  static async findAll() {
    const result = await query(`
      SELECT 
        c.*,
        u.name as teacher_name,
        u.email as teacher_email,
        (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id) as enrolled_count,
        (SELECT COUNT(*) FROM modules WHERE course_id = c.id) as modules_count
      FROM courses c
      LEFT JOIN users u ON c.teacher_id = u.id
      ORDER BY c.created_at DESC
    `);
    return result.rows;
  }

  // Obtener curso por ID
  static async findById(id) {
    const result = await query(`
      SELECT 
        c.*,
        u.name as teacher_name,
        u.email as teacher_email,
        (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id) as enrolled_count,
        (SELECT COUNT(*) FROM modules WHERE course_id = c.id) as modules_count
      FROM courses c
      LEFT JOIN users u ON c.teacher_id = u.id
      WHERE c.id = $1
    `, [id]);
    return result.rows[0];
  }

  // Obtener cursos de un profesor
  static async findByTeacher(teacherId) {
    const result = await query(`
      SELECT 
        c.*,
        (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id) as enrolled_count
      FROM courses c
      WHERE c.teacher_id = $1
      ORDER BY c.created_at DESC
    `, [teacherId]);
    return result.rows;
  }

  // Actualizar curso
  static async update(id, updates) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (updates.title) {
      fields.push(`title = $${paramCount}`);
      values.push(updates.title);
      paramCount++;
    }

    if (updates.description !== undefined) {
      fields.push(`description = $${paramCount}`);
      values.push(updates.description);
      paramCount++;
    }

    if (updates.videoFilename) {
      fields.push(`video_filename = $${paramCount}`);
      values.push(updates.videoFilename);
      paramCount++;
    }

    if (updates.duration !== undefined) {
      fields.push(`duration = $${paramCount}`);
      values.push(updates.duration);
      paramCount++;
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await query(
      `UPDATE courses SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    return result.rows[0];
  }

  // Eliminar curso
  static async delete(id) {
    const result = await query(
      'DELETE FROM courses WHERE id = $1 RETURNING id',
      [id]
    );
    return result.rows[0];
  }

  // Inscribir estudiante
  static async enroll(studentId, courseId) {
    try {
      const result = await query(
        'INSERT INTO enrollments (student_id, course_id) VALUES ($1, $2) RETURNING *',
        [studentId, courseId]
      );
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') { // Unique violation
        throw new Error('Ya estás inscrito en este curso');
      }
      throw error;
    }
  }

  // Desinscribir estudiante
  static async unenroll(studentId, courseId) {
    const result = await query(
      'DELETE FROM enrollments WHERE student_id = $1 AND course_id = $2 RETURNING id',
      [studentId, courseId]
    );
    return result.rows[0];
  }

  // Obtener cursos de un estudiante
  static async findEnrolled(studentId) {
    const result = await query(`
      SELECT 
        c.*,
        u.name as teacher_name,
        e.enrolled_at,
        (SELECT COUNT(*) FROM modules WHERE course_id = c.id) as total_modules,
        (SELECT COUNT(*) FROM progress p 
         JOIN modules m ON p.module_id = m.id 
         WHERE m.course_id = c.id AND p.student_id = $1 AND p.completed = true) as completed_modules
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      LEFT JOIN users u ON c.teacher_id = u.id
      WHERE e.student_id = $1
      ORDER BY e.enrolled_at DESC
    `, [studentId]);
    return result.rows;
  }

  // Verificar si está inscrito
  static async isEnrolled(studentId, courseId) {
    const result = await query(
      'SELECT id FROM enrollments WHERE student_id = $1 AND course_id = $2',
      [studentId, courseId]
    );
    return result.rows.length > 0;
  }
}

export default Course;
