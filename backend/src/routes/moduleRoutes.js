import express from 'express';
import ModuleController from '../controllers/moduleController.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Crear módulo (teacher)
router.post('/', authenticateToken, authorizeRole('teacher'), ModuleController.create);

// Obtener módulos de un curso
router.get('/course/:courseId', authenticateToken, ModuleController.getByCourse);

// Obtener módulo por ID
router.get('/:id', authenticateToken, ModuleController.getById);

// Actualizar módulo (teacher)
router.put('/:id', authenticateToken, authorizeRole('teacher'), ModuleController.update);

// Eliminar módulo (teacher)
router.delete('/:id', authenticateToken, authorizeRole('teacher'), ModuleController.delete);

export default router;
