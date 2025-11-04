import Course from '../models/Course.js';

class CourseController {
  // Crear curso (solo teacher)
  static async create(req, res) {
    try {
      const { title, description } = req.body;

      if (!title) {
        return res.status(400).json({ error: 'El título es requerido' });
      }

      const course = await Course.create({
        title,
        description,
        teacherId: req.user.id
      });

      res.status(201).json({
        message: 'Curso creado exitosamente. Ahora puedes agregar módulos.',
        course
      });
    } catch (error) {
      console.error('Error en create:', error);
      res.status(500).json({ error: 'Error al crear curso' });
    }
  }

  // Obtener todos los cursos
  static async getAll(req, res) {
    try {
      const courses = await Course.findAll();
      res.json({ courses });
    } catch (error) {
      console.error('Error en getAll:', error);
      res.status(500).json({ error: 'Error al obtener cursos' });
    }
  }

  // Obtener curso por ID
  static async getById(req, res) {
    try {
      const course = await Course.findById(req.params.id);
      
      if (!course) {
        return res.status(404).json({ error: 'Curso no encontrado' });
      }

      res.json({ course });
    } catch (error) {
      console.error('Error en getById:', error);
      res.status(500).json({ error: 'Error al obtener curso' });
    }
  }

  // Obtener cursos del profesor actual
  static async getMyCoursesTeacher(req, res) {
    try {
      const courses = await Course.findByTeacher(req.user.id);
      res.json({ courses });
    } catch (error) {
      console.error('Error en getMyCoursesTeacher:', error);
      res.status(500).json({ error: 'Error al obtener cursos' });
    }
  }

  // Obtener cursos inscritos del estudiante
  static async getMyCoursesStudent(req, res) {
    try {
      const courses = await Course.findEnrolled(req.user.id);
      res.json({ courses });
    } catch (error) {
      console.error('Error en getMyCoursesStudent:', error);
      res.status(500).json({ error: 'Error al obtener cursos' });
    }
  }

  // Actualizar curso
  static async update(req, res) {
    try {
      const course = await Course.findById(req.params.id);
      
      if (!course) {
        return res.status(404).json({ error: 'Curso no encontrado' });
      }

      // Verificar que el profesor es el dueño o es admin
      if (course.teacher_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'No tienes permisos para editar este curso' });
      }

      const updates = {};
      if (req.body.title) updates.title = req.body.title;
      if (req.body.description !== undefined) updates.description = req.body.description;
      if (req.body.videoFilename) updates.videoFilename = req.body.videoFilename;
      if (req.body.duration !== undefined) updates.duration = req.body.duration;

      const updatedCourse = await Course.update(req.params.id, updates);

      res.json({
        message: 'Curso actualizado exitosamente',
        course: updatedCourse
      });
    } catch (error) {
      console.error('Error en update:', error);
      res.status(500).json({ error: 'Error al actualizar curso' });
    }
  }

  // Eliminar curso
  static async delete(req, res) {
    try {
      const course = await Course.findById(req.params.id);
      
      if (!course) {
        return res.status(404).json({ error: 'Curso no encontrado' });
      }

      // Verificar permisos
      if (course.teacher_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'No tienes permisos para eliminar este curso' });
      }

      await Course.delete(req.params.id);

      res.json({ message: 'Curso eliminado exitosamente' });
    } catch (error) {
      console.error('Error en delete:', error);
      res.status(500).json({ error: 'Error al eliminar curso' });
    }
  }

  // Inscribirse en un curso (student)
  static async enroll(req, res) {
    try {
      const courseId = req.params.id;
      const studentId = req.user.id;

      const enrollment = await Course.enroll(studentId, courseId);

      res.status(201).json({
        message: 'Inscripción exitosa',
        enrollment
      });
    } catch (error) {
      console.error('Error en enroll:', error);
      if (error.message.includes('Ya estás inscrito')) {
        return res.status(409).json({ error: error.message });
      }
      res.status(500).json({ error: 'Error al inscribirse en el curso' });
    }
  }

  // Desinscribirse de un curso
  static async unenroll(req, res) {
    try {
      const courseId = req.params.id;
      const studentId = req.user.id;

      await Course.unenroll(studentId, courseId);

      res.json({ message: 'Desinscripción exitosa' });
    } catch (error) {
      console.error('Error en unenroll:', error);
      res.status(500).json({ error: 'Error al desinscribirse del curso' });
    }
  }
}

export default CourseController;
