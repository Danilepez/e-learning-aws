-- ================================================
-- MIGRACIÓN: Agregar tabla de módulos
-- ================================================

-- Crear tabla de módulos
CREATE TABLE IF NOT EXISTS modules (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    video_filename VARCHAR(255) NOT NULL,
    duration INTEGER DEFAULT 0,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear índice para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_modules_course ON modules(course_id);

-- Eliminar columnas video_filename y duration de courses (si existen)
ALTER TABLE courses DROP COLUMN IF EXISTS video_filename;
ALTER TABLE courses DROP COLUMN IF EXISTS duration;

-- Actualizar tabla progress para referenciar módulos en lugar de cursos
-- Primero eliminar la tabla progress existente
DROP TABLE IF EXISTS progress CASCADE;

-- Recrear progress referenciando módulos
CREATE TABLE progress (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,
    watched_seconds INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    last_position INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(student_id, module_id)
);

CREATE INDEX IF NOT EXISTS idx_progress_student ON progress(student_id);
CREATE INDEX IF NOT EXISTS idx_progress_module ON progress(module_id);

-- Eliminar cursos de demo antiguos (ya que no tienen módulos)
DELETE FROM courses WHERE id IN (1,2,3,4,5);

COMMENT ON TABLE modules IS 'Módulos de cada curso (1 video por módulo)';
COMMENT ON TABLE progress IS 'Progreso de visualización por módulo';

SELECT 'Migración completada exitosamente' as resultado;
