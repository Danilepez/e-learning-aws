import Enrollment from '../models/Enrollment.js';

class EnrollmentController {
  // Obtener todas las inscripciones (Admin)
  static async getAll(req, res) {
    try {
      const enrollments = await Enrollment.findAll();
      res.json({ enrollments });
    } catch (error) {
      console.error('Error en getAll enrollments:', error);
      res.status(500).json({ error: 'Error al obtener inscripciones' });
    }
  }

  // Inscribir estudiante en curso
  static async enroll(req, res) {
    try {
      const { course_id } = req.body;
      const studentId = req.user.id;

      // Verificar si ya está inscrito
      const isEnrolled = await Enrollment.isEnrolled(studentId, course_id);
      if (isEnrolled) {
        return res.status(400).json({ error: 'Ya estás inscrito en este curso' });
      }

      const enrollment = await Enrollment.create(studentId, course_id);
      res.status(201).json({
        message: 'Inscripción exitosa',
        enrollment
      });
    } catch (error) {
      console.error('Error en enroll:', error);
      res.status(500).json({ error: 'Error al inscribirse en el curso' });
    }
  }

  // Desinscribirse de un curso
  static async unenroll(req, res) {
    try {
      const { courseId } = req.params;
      const studentId = req.user.id;

      const enrollment = await Enrollment.delete(studentId, courseId);
      
      if (!enrollment) {
        return res.status(404).json({ error: 'Inscripción no encontrada' });
      }

      res.json({ message: 'Desinscripción exitosa' });
    } catch (error) {
      console.error('Error en unenroll:', error);
      res.status(500).json({ error: 'Error al desinscribirse del curso' });
    }
  }

  // Obtener inscripciones de un estudiante
  static async getMyEnrollments(req, res) {
    try {
      const enrollments = await Enrollment.findByStudent(req.user.id);
      res.json({ enrollments });
    } catch (error) {
      console.error('Error en getMyEnrollments:', error);
      res.status(500).json({ error: 'Error al obtener inscripciones' });
    }
  }
}

export default EnrollmentController;
