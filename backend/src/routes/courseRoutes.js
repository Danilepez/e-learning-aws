import express from 'express';
import CourseController from '../controllers/courseController.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Obtener todos los cursos (todos los roles)
router.get('/', CourseController.getAll);

// Obtener mis cursos (profesor o estudiante)
router.get('/my-courses', (req, res, next) => {
  if (req.user.role === 'teacher') {
    return CourseController.getMyCoursesTeacher(req, res);
  } else if (req.user.role === 'student') {
    return CourseController.getMyCoursesStudent(req, res);
  }
  res.status(403).json({ error: 'Rol no válido para esta operación' });
});

// Crear curso (solo teacher)
router.post('/', authorizeRole('teacher', 'admin'), CourseController.create);

// Obtener curso específico
router.get('/:id', CourseController.getById);

// Actualizar curso (teacher dueño o admin)
router.put('/:id', authorizeRole('teacher', 'admin'), CourseController.update);

// Eliminar curso (teacher dueño o admin)
router.delete('/:id', authorizeRole('teacher', 'admin'), CourseController.delete);

// Inscribirse en curso (solo student)
router.post('/:id/enroll', authorizeRole('student'), CourseController.enroll);

// Desinscribirse de curso (solo student)
router.delete('/:id/enroll', authorizeRole('student'), CourseController.unenroll);

export default router;
