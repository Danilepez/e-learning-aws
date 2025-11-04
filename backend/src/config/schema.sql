-- ================================================
-- SCHEMA DE BASE DE DATOS PARA eLEARNING
-- PostgreSQL
-- ================================================

-- Eliminar tablas si existen (solo para desarrollo)
DROP TABLE IF EXISTS progress CASCADE;
DROP TABLE IF EXISTS enrollments CASCADE;
DROP TABLE IF EXISTS modules CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Tabla de usuarios
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) CHECK (role IN ('admin', 'teacher', 'student')) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de cursos
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    teacher_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    thumbnail_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de módulos (cada curso tiene múltiples módulos)
CREATE TABLE modules (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    video_filename VARCHAR(255) NOT NULL,
    duration INTEGER DEFAULT 0, -- duración en segundos
    order_index INTEGER NOT NULL DEFAULT 0, -- orden del módulo en el curso
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de inscripciones
CREATE TABLE enrollments (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(student_id, course_id)
);

-- Tabla de progreso (ahora por módulo, no por curso)
CREATE TABLE progress (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,
    watched_seconds INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    last_position INTEGER DEFAULT 0, -- última posición del video
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(student_id, module_id)
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_courses_teacher ON courses(teacher_id);
CREATE INDEX idx_modules_course ON modules(course_id);
CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
CREATE INDEX idx_progress_student ON progress(student_id);
CREATE INDEX idx_progress_module ON progress(module_id);

-- Datos iniciales de demostración
INSERT INTO users (name, email, password_hash, role) VALUES
('Admin Sistema', 'admin@elearning.com', '$2a$10$rH5ZKvLXZLcYXXELXJhLCebCWd4mqg5Qj5z5Gv4J9xRZYXqzKh5y2', 'admin'),
('Prof. García', 'teacher@elearning.com', '$2a$10$rH5ZKvLXZLcYXXELXJhLCebCWd4mqg5Qj5z5Gv4J9xRZYXqzKh5y2', 'teacher'),
('María López', 'student@elearning.com', '$2a$10$rH5ZKvLXZLcYXXELXJhLCebCWd4mqg5Qj5z5Gv4J9xRZYXqzKh5y2', 'student');
-- Contraseña para todos: "password123"

COMMENT ON TABLE users IS 'Usuarios del sistema (admin, teacher, student)';
COMMENT ON TABLE courses IS 'Cursos creados por profesores';
COMMENT ON TABLE modules IS 'Módulos de cada curso (1 video por módulo)';
COMMENT ON TABLE enrollments IS 'Relación estudiante-curso';
COMMENT ON TABLE progress IS 'Progreso de visualización por módulo';
