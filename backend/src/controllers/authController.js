import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import config from '../config/config.js';

class AuthController {
  // Registrar nuevo usuario
  static async register(req, res) {
    try {
      const { name, email, password, role } = req.body;

      // Validar campos requeridos
      if (!name || !email || !password || !role) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
      }

      // Validar rol
      if (!['admin', 'teacher', 'student'].includes(role)) {
        return res.status(400).json({ error: 'Rol inválido' });
      }

      // Verificar si el email ya existe
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: 'El email ya está registrado' });
      }

      // Crear usuario
      const user = await User.create({ name, email, password, role });

      res.status(201).json({
        message: 'Usuario registrado exitosamente',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Error en register:', error);
      res.status(500).json({ error: 'Error al registrar usuario' });
    }
  }

  // Iniciar sesión
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validar campos
      if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña son requeridos' });
      }

      // Buscar usuario
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Credenciales incorrectas' });
      }

      // Verificar contraseña
      const validPassword = await User.verifyPassword(password, user.password_hash);
      if (!validPassword) {
        return res.status(401).json({ error: 'Credenciales incorrectas' });
      }

      // Generar token JWT
      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          role: user.role 
        },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      res.json({
        message: 'Login exitoso',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({ error: 'Error al iniciar sesión' });
    }
  }

  // Obtener perfil del usuario actual
  static async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.id);
      
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      res.json({ user });
    } catch (error) {
      console.error('Error en getProfile:', error);
      res.status(500).json({ error: 'Error al obtener perfil' });
    }
  }

  // Verificar token
  static async verifyToken(req, res) {
    // Si llegó aquí, el token es válido (authenticateToken middleware)
    res.json({ 
      valid: true, 
      user: req.user 
    });
  }
}

export default AuthController;
