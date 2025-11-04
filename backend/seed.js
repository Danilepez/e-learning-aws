import pool from './src/config/database.js';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const VIDEOS_PATH = 'C:\\Users\\danil\\Videos\\Captures';

async function seedDatabase() {
  try {
    console.log('🌱 Iniciando seed de base de datos...\n');

    // Resetear contraseñas de usuarios demo
    console.log('🔐 Actualizando contraseñas de usuarios demo...');
    const demoPassword = await bcrypt.hash('123456', 10);
    
    await pool.query(`
      UPDATE users 
      SET password_hash = $1 
      WHERE email IN ('admin@elearning.com', 'teacher@elearning.com', 'student@elearning.com')
    `, [demoPassword]);
    
    console.log('  ✅ Contraseñas actualizadas (password: 123456)\n');

    // Leer videos disponibles
    const videos = fs.readdirSync(VIDEOS_PATH).filter(f => f.endsWith('.mp4'));
    console.log(`📹 Videos encontrados: ${videos.length}\n`);

    // Crear cursos
    console.log('📚 Creando cursos...');
    
    const courses = [
      {
        title: 'Introducción a JavaScript',
        description: 'Aprende los fundamentos de JavaScript desde cero. Incluye variables, funciones, objetos y más.',
        teacherId: 2
      },
      {
        title: 'React Avanzado',
        description: 'Domina React con hooks, context, Redux y mejores prácticas de desarrollo.',
        teacherId: 2
      },
      {
        title: 'Node.js y Express',
        description: 'Crea APIs REST profesionales con Node.js y Express. Incluye autenticación JWT.',
        teacherId: 2
      },
      {
        title: 'Base de Datos PostgreSQL',
        description: 'Aprende SQL y PostgreSQL desde cero hasta nivel avanzado.',
        teacherId: 2
      },
      {
        title: 'Git y GitHub',
        description: 'Control de versiones profesional con Git y colaboración en GitHub.',
        teacherId: 2
      }
    ];

    const courseIds = [];
    for (const course of courses) {
      const result = await pool.query(
        'INSERT INTO courses (title, description, teacher_id) VALUES ($1, $2, $3) RETURNING id',
        [course.title, course.description, course.teacherId]
      );
      courseIds.push(result.rows[0].id);
      console.log(`  ✅ ${course.title} (ID: ${result.rows[0].id})`);
    }

    // Crear módulos para cada curso
    console.log('\n📖 Creando módulos...');
    
    const modules = [
      // Curso 1: JavaScript
      { courseId: courseIds[0], title: 'Módulo 1: Variables y Tipos de Datos', description: 'Aprende sobre variables, const, let y tipos de datos', videoFilename: videos[0] || 'video1.mp4', orderIndex: 0 },
      { courseId: courseIds[0], title: 'Módulo 2: Funciones', description: 'Funciones, arrow functions y scope', videoFilename: videos[1] || 'video2.mp4', orderIndex: 1 },
      { courseId: courseIds[0], title: 'Módulo 3: Arrays y Objetos', description: 'Manipulación de arrays y objetos', videoFilename: videos[2] || 'video3.mp4', orderIndex: 2 },
      
      // Curso 2: React
      { courseId: courseIds[1], title: 'Módulo 1: Hooks Avanzados', description: 'useEffect, useCallback, useMemo', videoFilename: videos[3] || 'video4.mp4', orderIndex: 0 },
      { courseId: courseIds[1], title: 'Módulo 2: Context API', description: 'Gestión de estado global', videoFilename: videos[0] || 'video1.mp4', orderIndex: 1 },
      { courseId: courseIds[1], title: 'Módulo 3: React Router', description: 'Navegación con React Router', videoFilename: videos[1] || 'video2.mp4', orderIndex: 2 },
      
      // Curso 3: Node.js
      { courseId: courseIds[2], title: 'Módulo 1: Express Básico', description: 'Introducción a Express', videoFilename: videos[2] || 'video3.mp4', orderIndex: 0 },
      { courseId: courseIds[2], title: 'Módulo 2: Middleware', description: 'Autenticación y middleware', videoFilename: videos[3] || 'video4.mp4', orderIndex: 1 },
      
      // Curso 4: PostgreSQL
      { courseId: courseIds[3], title: 'Módulo 1: SQL Básico', description: 'SELECT, INSERT, UPDATE, DELETE', videoFilename: videos[0] || 'video1.mp4', orderIndex: 0 },
      { courseId: courseIds[3], title: 'Módulo 2: Relaciones', description: 'JOINS y relaciones entre tablas', videoFilename: videos[1] || 'video2.mp4', orderIndex: 1 },
      
      // Curso 5: Git
      { courseId: courseIds[4], title: 'Módulo 1: Git Básico', description: 'Comandos básicos de Git', videoFilename: videos[2] || 'video3.mp4', orderIndex: 0 },
      { courseId: courseIds[4], title: 'Módulo 2: GitHub', description: 'Colaboración en GitHub', videoFilename: videos[3] || 'video4.mp4', orderIndex: 1 },
      { courseId: courseIds[4], title: 'Módulo 3: Git Avanzado', description: 'Rebase, cherry-pick y más', videoFilename: videos[0] || 'video1.mp4', orderIndex: 2 },
    ];

    for (const module of modules) {
      await pool.query(
        'INSERT INTO modules (course_id, title, description, video_filename, order_index) VALUES ($1, $2, $3, $4, $5)',
        [module.courseId, module.title, module.description, module.videoFilename, module.orderIndex]
      );
      console.log(`  ✅ ${module.title}`);
    }

    // Crear inscripciones de prueba (estudiante ID 3 inscrito en cursos 1, 2, 3)
    console.log('\n👨‍🎓 Creando inscripciones de prueba...');
    for (let i = 0; i < 3; i++) {
      await pool.query(
        'INSERT INTO enrollments (student_id, course_id) VALUES ($1, $2)',
        [3, courseIds[i]]
      );
      console.log(`  ✅ Estudiante inscrito en ${courses[i].title}`);
    }

    console.log('\n🎉 ¡Seed completado exitosamente!');
    console.log('\n📊 Resumen:');
    console.log(`   - ${courses.length} cursos creados`);
    console.log(`   - ${modules.length} módulos creados`);
    console.log(`   - 3 inscripciones creadas`);
    console.log('\n✨ La base de datos está lista para usar\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error en seed:', error);
    process.exit(1);
  }
}

seedDatabase();
