# 🚀 GUÍA DE INSTALACIÓN Y EJECUCIÓN

## 📁 Estructura del Proyecto

```
Plataforma eLearning/
├── backend/                 ← API Node.js + Express + PostgreSQL
│   ├── src/
│   │   ├── config/         ← Configuración DB, JWT
│   │   ├── controllers/    ← Lógica de negocio
│   │   ├── models/         ← Modelos de datos
│   │   ├── routes/         ← Rutas API
│   │   ├── middleware/     ← Auth middleware
│   │   └── server.js       ← Servidor principal
│   ├── package.json
│   └── .env.example
│
├── frontend/                ← React + Material-UI
│   ├── src/
│   │   ├── components/     ← Componentes React
│   │   ├── contexts/       ← Context API
│   │   ├── layouts/        ← Layouts
│   │   ├── theme/          ← Tema Material-UI
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── video-server/            ← Servidor de videos LOCAL
│   ├── video-server.js     ← Express + Multer
│   └── package.json
│
└── docs/                    ← Documentación
```

## ⚙️ INSTALACIÓN

### 1. Instalar PostgreSQL

```powershell
# Descargar desde: https://www.postgresql.org/download/windows/
# O con Chocolatey:
choco install postgresql

# Crear base de datos
psql -U postgres
CREATE DATABASE elearning;
\q
```

### 2. Configurar Backend

```powershell
cd backend

# Instalar dependencias
npm install

# Copiar variables de entorno
copy .env.example .env

# Editar .env con tus credenciales de PostgreSQL
notepad .env
```

**Edita `.env`:**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=elearning
DB_USER=postgres
DB_PASSWORD=tu_password_aqui
JWT_SECRET=cambia_esto_por_algo_seguro
```

**Crear tablas en la base de datos:**
```powershell
# Ejecutar el schema SQL
psql -U postgres -d elearning -f src/config/schema.sql
```

### 3. Configurar Frontend

```powershell
cd ../frontend

# Instalar dependencias
npm install

# Crear archivo de variables de entorno (opcional)
echo VITE_API_URL=http://localhost:5000/api > .env
echo VITE_VIDEO_SERVER_URL=http://localhost:8080 >> .env
```

### 4. Configurar Video Server (ya tienes el código)

```powershell
cd ../video-server

# Las dependencias ya están instaladas
# Crear carpeta de videos si no existe
mkdir C:\Videos\Cursos
```

## 🚀 EJECUCIÓN

### Opción A: Ejecutar todo manualmente (3 terminales)

**Terminal 1 - Backend:**
```powershell
cd backend
npm run dev
# Corre en http://localhost:5000
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm run dev
# Corre en http://localhost:5173
```

**Terminal 3 - Video Server:**
```powershell
cd video-server
node video-server.js
# Corre en http://localhost:8080
```

### Opción B: Script automatizado (próximamente)

## 🔧 CONFIGURAR CLOUDFLARE TUNNEL (Para videos permanentes)

### 1. Instalar cloudflared

```powershell
choco install cloudflared
```

### 2. Autenticar

```powershell
cloudflared tunnel login
```

### 3. Crear tunnel

```powershell
cloudflared tunnel create videos-elearning
```

### 4. Configurar tunnel

Crear archivo `C:\Users\TU_USUARIO\.cloudflared\config.yml`:

```yaml
tunnel: TU_TUNNEL_ID
credentials-file: C:\Users\TU_USUARIO\.cloudflared\TU_TUNNEL_ID.json

ingress:
  - hostname: videos.tu-dominio.com
    service: http://localhost:8080
  - service: http_status:404
```

### 5. Iniciar tunnel

```powershell
cloudflared tunnel run videos-elearning
```

### 6. Actualizar configuración del frontend

Edita `frontend/src/config.js`:
```javascript
videoServerUrl: 'https://videos.tu-dominio.com',
```

## 📊 USUARIOS DE PRUEBA

Después de ejecutar el schema.sql, tendrás estos usuarios:

| Email | Contraseña | Rol |
|-------|------------|-----|
| admin@elearning.com | password123 | admin |
| teacher@elearning.com | password123 | teacher |
| student@elearning.com | password123 | student |

## 🎯 PRÓXIMOS PASOS

1. ✅ **Backend funcionando** en `http://localhost:5000`
2. ✅ **Frontend funcionando** en `http://localhost:5173`
3. ✅ **Video server funcionando** en `http://localhost:8080`
4. ⏳ **Subir videos** a `C:\Videos\Cursos`
5. ⏳ **Configurar Cloudflare Tunnel** para URL permanente
6. ⏳ **Desplegar en AWS EC2** (backend + frontend)

## ❓ SOLUCIÓN DE PROBLEMAS

### Error: "No se puede conectar a PostgreSQL"
```powershell
# Verificar que PostgreSQL esté corriendo
Get-Service postgresql*

# Iniciar servicio
Start-Service postgresql-x64-15
```

### Error: "EADDRINUSE: puerto ya en uso"
```powershell
# Ver qué proceso está usando el puerto 5000
netstat -ano | findstr :5000

# Matar proceso
taskkill /PID NUMERO_PID /F
```

### Error: "Cannot find module"
```powershell
# Reinstalar dependencias
rm -r node_modules
npm install
```

## 📚 DOCUMENTACIÓN ADICIONAL

- Backend API: `http://localhost:5000/health`
- Frontend: `http://localhost:5173`
- Videos: `http://localhost:8080/api/videos`

## 🎓 ARQUITECTURA DEL PROYECTO

### Backend (Puerto 5000)
- **API REST** con Express
- **PostgreSQL** para datos
- **JWT** para autenticación
- **Bcrypt** para passwords

### Frontend (Puerto 5173)
- **React 18** con hooks
- **Material-UI** diseño formal
- **React Router** rutas separadas
- **Axios** peticiones HTTP
- **Context API** estado global

### Video Server (Puerto 8080)
- **Express** servidor HTTP
- **Multer** subida de archivos
- **Streaming** con range requests
- **CORS** habilitado

## 🔐 SEGURIDAD

- ✅ Contraseñas hasheadas con bcrypt
- ✅ JWT tokens con expiración
- ✅ CORS configurado
- ✅ Rate limiting en API
- ✅ Helmet para headers de seguridad
- ✅ SQL injection prevention (pg con prepared statements)

## 🚀 DESPLIEGUE EN AWS

### Backend en EC2
1. Crear instancia t3.micro
2. Instalar Node.js y PM2
3. Clonar repositorio
4. Configurar variables de entorno
5. `pm2 start src/server.js --name backend`

### Frontend en EC2 (o S3 + CloudFront)
1. `npm run build`
2. Subir carpeta `dist/` a EC2
3. Configurar Nginx como proxy

### Base de Datos en RDS
1. Crear instancia PostgreSQL
2. Ejecutar schema.sql
3. Actualizar .env del backend con credenciales RDS

## 📞 SOPORTE

Si tienes problemas, verifica:
1. PostgreSQL está corriendo
2. Puertos 5000, 5173, 8080 están libres
3. Variables de entorno correctas
4. Node.js versión 18+ instalado

---

¡Listo para desarrollar! 🎉
