import Module from '../models/Module.js';
import Course from '../models/Course.js';

class ModuleController {
  // Crear módulo
  static async create(req, res) {
    try {
      const { courseId, title, description, videoFilename, orderIndex } = req.body;

      if (!courseId || !title || !videoFilename) {
        return res.status(400).json({ 
          error: 'ID del curso, título y video son requeridos' 
        });
      }

      // Verificar que el curso existe y pertenece al profesor
      const course = await Course.findById(courseId);
      if (!course) {
        return res.status(404).json({ error: 'Curso no encontrado' });
      }

      if (course.teacher_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'No tienes permiso para agregar módulos a este curso' });
      }

      const module = await Module.create({
        courseId,
        title,
        description,
        videoFilename,
        orderIndex: orderIndex || 0
      });

      res.status(201).json({
        message: 'Módulo creado exitosamente',
        module
      });
    } catch (error) {
      console.error('Error en create module:', error);
      res.status(500).json({ error: 'Error al crear módulo' });
    }
  }

  // Obtener todos los módulos de un curso
  static async getByCourse(req, res) {
    try {
      const modules = await Module.findByCourse(req.params.courseId);
      res.json({ modules });
    } catch (error) {
      console.error('Error en getByCourse:', error);
      res.status(500).json({ error: 'Error al obtener módulos' });
    }
  }

  // Obtener módulo por ID
  static async getById(req, res) {
    try {
      const module = await Module.findById(req.params.id);
      
      if (!module) {
        return res.status(404).json({ error: 'Módulo no encontrado' });
      }

      res.json({ module });
    } catch (error) {
      console.error('Error en getById:', error);
      res.status(500).json({ error: 'Error al obtener módulo' });
    }
  }

  // Actualizar módulo
  static async update(req, res) {
    try {
      const { title, description, videoFilename, orderIndex } = req.body;
      const moduleId = req.params.id;

      // Verificar que el módulo existe
      const existingModule = await Module.findById(moduleId);
      if (!existingModule) {
        return res.status(404).json({ error: 'Módulo no encontrado' });
      }

      // Verificar que el curso pertenece al profesor
      const course = await Course.findById(existingModule.course_id);
      if (course.teacher_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'No tienes permiso para editar este módulo' });
      }

      const module = await Module.update(moduleId, {
        title,
        description,
        videoFilename,
        orderIndex
      });

      res.json({
        message: 'Módulo actualizado exitosamente',
        module
      });
    } catch (error) {
      console.error('Error en update:', error);
      res.status(500).json({ error: 'Error al actualizar módulo' });
    }
  }

  // Eliminar módulo
  static async delete(req, res) {
    try {
      const moduleId = req.params.id;

      // Verificar que el módulo existe
      const module = await Module.findById(moduleId);
      if (!module) {
        return res.status(404).json({ error: 'Módulo no encontrado' });
      }

      // Verificar que el curso pertenece al profesor
      const course = await Course.findById(module.course_id);
      if (course.teacher_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'No tienes permiso para eliminar este módulo' });
      }

      await Module.delete(moduleId);

      res.json({ message: 'Módulo eliminado exitosamente' });
    } catch (error) {
      console.error('Error en delete:', error);
      res.status(500).json({ error: 'Error al eliminar módulo' });
    }
  }
}

export default ModuleController;
