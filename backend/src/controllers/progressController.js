import Progress from '../models/Progress.js';

class ProgressController {
  // Actualizar progreso de un módulo
  static async update(req, res) {
    try {
      const { moduleId, watchedSeconds, lastPosition, completed } = req.body;
      const studentId = req.user.id;

      if (!moduleId || watchedSeconds === undefined) {
        return res.status(400).json({ error: 'moduleId y watchedSeconds son requeridos' });
      }

      const progress = await Progress.upsert(studentId, moduleId, {
        watchedSeconds,
        lastPosition: lastPosition || 0,
        completed: completed || false
      });

      res.json({
        message: 'Progreso actualizado',
        progress
      });
    } catch (error) {
      console.error('Error en update:', error);
      res.status(500).json({ error: 'Error al actualizar progreso' });
    }
  }

  // Obtener progreso de un módulo específico
  static async getProgress(req, res) {
    try {
      const moduleId = req.params.moduleId;
      const studentId = req.user.id;

      const progress = await Progress.find(studentId, moduleId);

      res.json({ progress: progress || null });
    } catch (error) {
      console.error('Error en getProgress:', error);
      res.status(500).json({ error: 'Error al obtener progreso' });
    }
  }

  // Obtener todo el progreso del estudiante
  static async getAllProgress(req, res) {
    try {
      const progress = await Progress.findByStudent(req.user.id);
      res.json({ progress });
    } catch (error) {
      console.error('Error en getAllProgress:', error);
      res.status(500).json({ error: 'Error al obtener progreso' });
    }
  }

  // Marcar módulo como completado
  static async markCompleted(req, res) {
    try {
      const moduleId = req.params.moduleId;
      const studentId = req.user.id;

      const progress = await Progress.markCompleted(studentId, moduleId);

      res.json({
        message: '¡Módulo completado!',
        progress
      });
    } catch (error) {
      console.error('Error en markCompleted:', error);
      res.status(500).json({ error: 'Error al marcar módulo como completado' });
    }
  }

  // Obtener estadísticas del estudiante
  static async getStats(req, res) {
    try {
      const stats = await Progress.getStats(req.user.id);
      res.json({ stats });
    } catch (error) {
      console.error('Error en getStats:', error);
      res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
  }
}

export default ProgressController;
