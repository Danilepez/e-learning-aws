import User from '../models/User.js';

class UserController {
  // Obtener todos los usuarios (solo admin)
  static async getAll(req, res) {
    try {
      const users = await User.findAll();
      res.json({ users });
    } catch (error) {
      console.error('Error en getAll:', error);
      res.status(500).json({ error: 'Error al obtener usuarios' });
    }
  }

  // Obtener usuario por ID
  static async getById(req, res) {
    try {
      const user = await User.findById(req.params.id);
      
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      res.json({ user });
    } catch (error) {
      console.error('Error en getById:', error);
      res.status(500).json({ error: 'Error al obtener usuario' });
    }
  }

  // Actualizar usuario
  static async update(req, res) {
    try {
      const updates = {};
      
      if (req.body.name) updates.name = req.body.name;
      if (req.body.email) updates.email = req.body.email;
      if (req.body.password) updates.password = req.body.password;
      if (req.body.role && req.user.role === 'admin') updates.role = req.body.role;

      const user = await User.update(req.params.id, updates);
      
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      res.json({ 
        message: 'Usuario actualizado exitosamente',
        user 
      });
    } catch (error) {
      console.error('Error en update:', error);
      res.status(500).json({ error: 'Error al actualizar usuario' });
    }
  }

  // Eliminar usuario
  static async delete(req, res) {
    try {
      const user = await User.delete(req.params.id);
      
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      res.json({ message: 'Usuario eliminado exitosamente' });
    } catch (error) {
      console.error('Error en delete:', error);
      res.status(500).json({ error: 'Error al eliminar usuario' });
    }
  }

  // Obtener estadísticas
  static async getStats(req, res) {
    try {
      const stats = await User.getStatsByRole();
      res.json({ stats });
    } catch (error) {
      console.error('Error en getStats:', error);
      res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
  }
}

export default UserController;
