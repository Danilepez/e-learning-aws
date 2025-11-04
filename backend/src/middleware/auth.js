import jwt from 'jsonwebtoken';
import config from '../config/config.js';

// Middleware para verificar token JWT
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  jwt.verify(token, config.jwt.secret, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token inválido o expirado' });
    }

    req.user = user; // { id, email, role }
    next();
  });
};

// Middleware para verificar rol específico
export const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'No tienes permisos para realizar esta acción',
        requiredRole: allowedRoles,
        yourRole: req.user.role
      });
    }

    next();
  };
};

// Middleware para verificar que es el mismo usuario o admin
export const authorizeSelfOrAdmin = (req, res, next) => {
  const targetUserId = parseInt(req.params.id || req.params.userId);
  
  if (req.user.role === 'admin' || req.user.id === targetUserId) {
    next();
  } else {
    res.status(403).json({ error: 'No tienes permisos para acceder a este recurso' });
  }
};
