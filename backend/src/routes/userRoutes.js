import express from 'express';
import UserController from '../controllers/userController.js';
import { authenticateToken, authorizeRole, authorizeSelfOrAdmin } from '../middleware/auth.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Solo admin puede ver todos los usuarios
router.get('/', authorizeRole('admin'), UserController.getAll);

// Admin puede ver estadísticas
router.get('/stats', authorizeRole('admin'), UserController.getStats);

// Usuario puede ver su propio perfil o admin puede ver cualquiera
router.get('/:id', authorizeSelfOrAdmin, UserController.getById);

// Usuario puede actualizar su propio perfil o admin puede actualizar cualquiera
router.put('/:id', authorizeSelfOrAdmin, UserController.update);

// Solo admin puede eliminar usuarios
router.delete('/:id', authorizeRole('admin'), UserController.delete);

export default router;
