import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const { Client } = pg;

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function createDemoCourses() {
  try {
    console.log('🔐 Conectando a la base de datos...');
    await client.connect();
    console.log('✅ Conectado exitosamente\n');

    // Obtener el profesor (teacher@elearning.com)
    const teacherResult = await client.query(
      "SELECT id FROM users WHERE email = 'teacher@elearning.com'"
    );
    
    if (teacherResult.rows.length === 0) {
      console.log('❌ No se encontró el usuario teacher@elearning.com');
      return;
    }

    const teacherId = teacherResult.rows[0].id;
    console.log(`👨‍🏫 Teacher ID: ${teacherId}\n`);

    // Buscar videos en la carpeta de Captures
    const videosPath = 'C:\\Users\\danil\\Videos\\Captures';
    let videoFiles = [];
    
    if (fs.existsSync(videosPath)) {
      videoFiles = fs.readdirSync(videosPath)
        .filter(file => file.endsWith('.mp4'))
        .slice(0, 5); // Máximo 5 videos
      console.log(`📹 Videos encontrados: ${videoFiles.length}`);
      videoFiles.forEach(v => console.log(`   - ${v}`));
    } else {
      console.log('⚠️ Carpeta de videos no encontrada, usando nombres genéricos');
      videoFiles = ['video1.mp4', 'video2.mp4', 'video3.mp4'];
    }

    console.log('\n📚 Creando cursos de demostración...\n');

    // Cursos de demo con descripciones
    const demoCourses = [
      {
        title: 'Introducción a JavaScript',
        description: 'Aprende los fundamentos de JavaScript desde cero. Variables, funciones, objetos y más.',
        video: videoFiles[0] || 'intro-javascript.mp4'
      },
      {
        title: 'React Básico',
        description: 'Domina React creando componentes, manejando estado y hooks básicos.',
        video: videoFiles[1] || 'react-basico.mp4'
      },
      {
        title: 'Node.js y Express',
        description: 'Crea APIs RESTful con Node.js y Express. Backend desde cero.',
        video: videoFiles[2] || 'nodejs-express.mp4'
      },
      {
        title: 'Base de Datos PostgreSQL',
        description: 'Aprende SQL, consultas avanzadas y diseño de bases de datos con PostgreSQL.',
        video: videoFiles[3] || 'postgresql.mp4'
      },
      {
        title: 'Git y GitHub',
        description: 'Control de versiones con Git. Branches, commits, pull requests y colaboración.',
        video: videoFiles[4] || 'git-github.mp4'
      }
    ];

    // Insertar cursos
    for (const course of demoCourses) {
      try {
        const result = await client.query(
          `INSERT INTO courses (title, description, teacher_id, video_filename, duration) 
           VALUES ($1, $2, $3, $4, $5) RETURNING id, title`,
          [course.title, course.description, teacherId, course.video, 0]
        );
        
        console.log(`✅ Curso creado: "${result.rows[0].title}" (ID: ${result.rows[0].id})`);
        console.log(`   Video: ${course.video}`);
      } catch (err) {
        if (err.code === '23505') { // Duplicate
          console.log(`⚠️ Curso ya existe: "${course.title}"`);
        } else {
          console.error(`❌ Error al crear "${course.title}":`, err.message);
        }
      }
    }

    console.log('\n🎉 ¡Cursos de demostración creados exitosamente!');
    console.log('\n📋 Ahora puedes:');
    console.log('   1. Iniciar sesión como teacher@elearning.com');
    console.log('   2. Ver tus cursos en el panel de Teacher');
    console.log('   3. Los estudiantes podrán inscribirse en estos cursos');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

createDemoCourses();
