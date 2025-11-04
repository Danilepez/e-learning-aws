import express from 'express';
import AuthController from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Rutas públicas
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// Rutas protegidas
router.get('/profile', authenticateToken, AuthController.getProfile);
router.get('/verify', authenticateToken, AuthController.verifyToken);

export default router;
