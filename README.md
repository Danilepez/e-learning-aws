# 🎓 Plataforma eLearning - Universidad UPB

Plataforma de aprendizaje en línea con arquitectura híbrida (nube + on-premise).

## 📋 Descripción del Proyecto

Este proyecto fue desarrollado para la materia **Aplicaciones con Redes** en la Universidad UPB (Sexto Semestre). Implementa una plataforma eLearning completa con las siguientes características:

### ✨ Características Principales

- **Autenticación segura** con JWT
- **Roles de usuario**: Admin, Profesor, Estudiante
- **Gestión de cursos** con videos
- **Seguimiento de progreso** de estudiantes
- **Interfaz profesional** con Material-UI
- **Arquitectura híbrida**: Web en AWS, videos locales con Cloudflare Tunnel

### 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                    │
│              Material-UI + React Router                 │
│                    Puerto 5173                          │
└────────────────────┬────────────────────────────────────┘
                     │
            ┌────────┴────────┐
            │                 │
    ┌───────▼──────┐   ┌─────▼──────────┐
    │   BACKEND    │   │ VIDEO SERVER   │
    │   (Express)  │   │   (Express)    │
    │  Puerto 5000 │   │  Puerto 8080   │
    └───────┬──────┘   └────────────────┘
            │                 │
    ┌───────▼──────┐          │
    │  PostgreSQL  │    Videos en PC
    │   (RDS/Local)│    + Cloudflare
    └──────────────┘         Tunnel
```

## 📁 Estructura del Proyecto

```
Plataforma eLearning/
├── backend/                 # API REST con Node.js + Express
│   ├── src/
│   │   ├── config/         # Configuración DB, JWT
│   │   ├── controllers/    # Lógica de negocio
│   │   ├── models/         # Modelos PostgreSQL
│   │   ├── routes/         # Rutas API
│   │   ├── middleware/     # Autenticación
│   │   └── server.js
│   └── package.json
│
├── frontend/               # React + Material-UI
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   │   ├── Admin/     # Dashboard, Users
│   │   │   ├── Teacher/   # Cursos, Videos
│   │   │   └── Student/   # Cursos, Progreso
│   │   ├── contexts/      # AuthContext
│   │   ├── layouts/       # AdminLayout, etc.
│   │   └── theme/         # Tema Material-UI
│   └── package.json
│
├── video-server/          # Servidor de videos local
│   ├── video-server.js   # Streaming + Upload
│   └── package.json
│
└── docs/                  # Documentación
    └── INSTALACION.md
```

## 🚀 Instalación Rápida

### Prerrequisitos

- Node.js 18+ 
- PostgreSQL 14+
- npm o yarn

### 1. Clonar repositorio

```powershell
git clone <tu-repositorio>
cd "Plataforma eLearning"
```

### 2. Instalar Backend

```powershell
cd backend
npm install
copy .env.example .env
# Editar .env con tus credenciales de PostgreSQL
```

### 3. Crear base de datos

```powershell
# Crear base de datos
psql -U postgres -c "CREATE DATABASE elearning;"

# Ejecutar schema
psql -U postgres -d elearning -f src/config/schema.sql
```

### 4. Instalar Frontend

```powershell
cd ../frontend
npm install
```

### 5. Video Server (ya configurado)

```powershell
cd ../video-server
# Crear carpeta de videos
mkdir C:\Videos\Cursos
```

## ▶️ Ejecución

### Desarrollo Local (3 terminales)

**Terminal 1 - Backend:**
```powershell
cd backend
npm run dev
# → http://localhost:5000
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm run dev
# → http://localhost:5173
```

**Terminal 3 - Video Server:**
```powershell
cd video-server
node video-server.js
# → http://localhost:8080
```

## 👥 Usuarios de Prueba

| Email | Contraseña | Rol |
|-------|------------|-----|
| `admin@elearning.com` | password123 | Administrador |
| `teacher@elearning.com` | password123 | Profesor |
| `student@elearning.com` | password123 | Estudiante |

## 🌐 Cloudflare Tunnel (URL Permanente)

### ¿Por qué Cloudflare Tunnel?

- ✅ **URL fija** que nunca cambia
- ✅ **GRATIS** para siempre
- ✅ **HTTPS** automático
- ✅ No necesitas abrir puertos en tu router

### Instalación

```powershell
# Instalar cloudflared
choco install cloudflared

# Autenticar
cloudflared tunnel login

# Crear tunnel
cloudflared tunnel create videos-elearning

# Configurar (ver docs/INSTALACION.md)
```

### Configuración

Crear `~/.cloudflared/config.yml`:

```yaml
tunnel: TU_TUNNEL_ID
credentials-file: C:\Users\TU_USUARIO\.cloudflared\TU_TUNNEL_ID.json

ingress:
  - hostname: videos.tu-dominio.com
    service: http://localhost:8080
  - service: http_status:404
```

### Iniciar tunnel

```powershell
cloudflared tunnel run videos-elearning
```

¡Tu video server ahora está accesible en `https://videos.tu-dominio.com`!

## 📚 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/profile` - Obtener perfil

### Usuarios (Admin)
- `GET /api/users` - Listar usuarios
- `GET /api/users/:id` - Ver usuario
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario

### Cursos
- `GET /api/courses` - Listar cursos
- `POST /api/courses` - Crear curso (Teacher)
- `GET /api/courses/:id` - Ver curso
- `PUT /api/courses/:id` - Actualizar curso
- `DELETE /api/courses/:id` - Eliminar curso
- `POST /api/courses/:id/enroll` - Inscribirse (Student)

### Progreso
- `POST /api/progress` - Actualizar progreso
- `GET /api/progress` - Ver todo el progreso
- `GET /api/progress/:courseId` - Progreso de un curso

### Videos (Video Server)
- `GET /api/videos` - Listar videos
- `POST /api/videos/upload` - Subir video
- `DELETE /api/videos/:filename` - Eliminar video
- `GET /videos/:filename` - Streaming de video

## 🔒 Seguridad

- ✅ Contraseñas hasheadas con `bcrypt`
- ✅ Tokens JWT con expiración
- ✅ Middleware de autenticación
- ✅ Rate limiting en API
- ✅ CORS configurado
- ✅ Helmet para headers HTTP
- ✅ Prepared statements (PostgreSQL)

## 🚀 Despliegue en AWS

### Backend en EC2
```bash
# Instalar Node.js y PM2
curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g pm2

# Clonar y configurar
git clone <tu-repo>
cd backend
npm install
cp .env.example .env
# Editar .env con credenciales RDS

# Iniciar con PM2
pm2 start src/server.js --name backend
pm2 save
pm2 startup
```

### Frontend en EC2/S3
```bash
# Build
cd frontend
npm run build

# Subir dist/ a S3 o servir con Nginx en EC2
```

### Base de Datos en RDS
1. Crear instancia PostgreSQL en AWS Console
2. Ejecutar `schema.sql` en la instancia
3. Actualizar `.env` del backend con endpoint RDS

## 📖 Documentación Adicional

- [Guía de Instalación Completa](docs/INSTALACION.md)
- [Arquitectura AWS](docs/AWS_ARCHITECTURE.md) (próximamente)
- [API Reference](docs/API.md) (próximamente)

## 🛠️ Tecnologías Utilizadas

### Backend
- Node.js 18
- Express.js 4
- PostgreSQL 14
- JWT
- Bcrypt
- Multer

### Frontend
- React 18
- Material-UI 5
- React Router 6
- Axios
- Vite

### Video Server
- Express
- Multer
- Cloudflare Tunnel

## 👨‍💻 Autor

**Daniel Lopez**  
Universidad Privada Boliviana - UPB  
Materia: Aplicaciones con Redes  
Sexto Semestre - 2025

## 📄 Licencia

Este proyecto es de código abierto para fines educativos.

---

¿Preguntas? Revisa la [documentación completa](docs/INSTALACION.md) o crea un issue.

