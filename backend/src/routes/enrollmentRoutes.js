import express from 'express';
import EnrollmentController from '../controllers/enrollmentController.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Obtener todas las inscripciones (solo admin)
router.get('/', authenticateToken, authorizeRole('admin'), EnrollmentController.getAll);

// Inscribirse en un curso (estudiante)
router.post('/enroll', authenticateToken, authorizeRole('student'), EnrollmentController.enroll);

// Desinscribirse de un curso (estudiante)
router.delete('/:courseId', authenticateToken, authorizeRole('student'), EnrollmentController.unenroll);

// Obtener mis inscripciones (estudiante)
router.get('/my-enrollments', authenticateToken, authorizeRole('student'), EnrollmentController.getMyEnrollments);

export default router;
