# 🎓 Frontend eLearning - React + Vite + Material-UI

## ✅ Completamente Terminado

Todos los componentes están creados y funcionando:
- ✅ Login y Register
- ✅ Panel Admin (Dashboard, Usuarios, Cursos)
- ✅ Panel Profesor (Cursos, Crear, Videos)
- ✅ Panel Estudiante (Cursos disponibles, Mis cursos, Visor)

## 🚀 Inicio Rápido

```powershell
# 1. Instalar dependencias
npm install

# 2. Crear archivo .env
copy .env.example .env

# 3. Iniciar desarrollo
npm run dev
```

La aplicación abrirá en `http://localhost:5173`

## 🔑 Usuarios de Prueba

| Email | Contraseña | Rol |
|-------|-----------|-----|
| admin@elearning.com | password123 | Admin |
| teacher@elearning.com | password123 | Profesor |
| student@elearning.com | password123 | Estudiante |

## 📁 Estructura

```
frontend/
├── src/
│   ├── components/
│   │   ├── Admin/          ← Dashboard, UserManagement, AdminCourses
│   │   ├── Teacher/        ← TeacherCourses, CreateCourse, VideoManagement
│   │   ├── Student/        ← AvailableCourses, MyCourses, CourseViewer
│   │   └── Auth/           ← Login, Register, ProtectedRoute
│   ├── layouts/            ← AdminLayout, TeacherLayout, StudentLayout
│   ├── contexts/           ← AuthContext (JWT)
│   ├── theme/              ← Material-UI theme
│   ├── config.js           ← API URLs
│   ├── App.jsx             ← Router con todas las rutas
│   └── main.jsx
├── package.json
├── vite.config.js
└── .env.example
```

## 🎨 Rutas Disponibles

### 🔓 Públicas
- `/login` - Iniciar sesión
- `/register` - Registro de usuarios

### 👨‍💼 Admin
- `/admin/dashboard` - Estadísticas
- `/admin/usuarios` - Gestión de usuarios
- `/admin/cursos` - Gestión de cursos

### 👨‍🏫 Profesor
- `/teacher/cursos` - Mis cursos
- `/teacher/crear` - Crear nuevo curso
- `/teacher/videos` - Subir/eliminar videos

### 👨‍🎓 Estudiante
- `/student/disponibles` - Cursos disponibles
- `/student/cursos` - Mis cursos inscritos
- `/student/curso/:id` - Visor de curso

## ⚙️ Variables de Entorno

```bash
VITE_API_URL=http://localhost:5000/api
VITE_VIDEO_SERVER_URL=http://localhost:8080
```

## 📦 Tecnologías

- **React 18.2.0** - UI Library
- **Material-UI 5.15.0** - Componentes
- **React Router 6.20.1** - Navegación
- **Axios 1.6.2** - HTTP Cliente
- **Vite 5.0.8** - Build tool

## 🔒 Autenticación

JWT almacenado en `localStorage` con:
- Auto-login en recarga de página
- Interceptor de Axios para tokens
- ProtectedRoute por rol

## 🚀 Build para Producción

```powershell
npm run build
```

Los archivos compilados estarán en `dist/`

## 📝 Notas

- El backend debe estar corriendo en `http://localhost:5000`
- El video-server debe estar en `http://localhost:8080`
- Asegúrate de crear el archivo `.env` con las URLs correctas
