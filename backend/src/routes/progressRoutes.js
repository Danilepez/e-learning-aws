import express from 'express';
import ProgressController from '../controllers/progressController.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Todas las rutas requieren autenticación de estudiante
router.use(authenticateToken);
router.use(authorizeRole('student'));

// Actualizar progreso
router.post('/', ProgressController.update);

// Obtener todo el progreso
router.get('/', ProgressController.getAllProgress);

// Obtener estadísticas
router.get('/stats', ProgressController.getStats);

// Obtener progreso de un módulo específico
router.get('/module/:moduleId', ProgressController.getProgress);

// Marcar módulo como completado
router.post('/module/:moduleId/complete', ProgressController.markCompleted);

export default router;
