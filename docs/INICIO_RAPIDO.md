# 🚀 INICIO RÁPIDO - 5 MINUTOS

## ✅ Pasos para tener todo funcionando

### 1️⃣ Instalar Backend (2 minutos)

```powershell
cd backend
npm install
copy .env.example .env
```

**Edita `.env`** con tus credenciales de PostgreSQL:
```
DB_PASSWORD=tu_password_de_postgres
```

**Crear base de datos:**
```powershell
psql -U postgres -c "CREATE DATABASE elearning;"
psql -U postgres -d elearning -f src/config/schema.sql
```

### 2️⃣ Instalar Frontend (1 minuto)

```powershell
cd ../frontend
npm install
```

### 3️⃣ Ejecutar todo (3 terminales)

**Terminal 1:**
```powershell
cd backend
npm run dev
```

**Terminal 2:**
```powershell
cd frontend
npm run dev
```

**Terminal 3:**
```powershell
cd video-server
node video-server.js
```

### 4️⃣ Probar la aplicación

1. Abre http://localhost:5173
2. Login con: `admin@elearning.com` / `password123`
3. ¡Listo! 🎉

---

## 🎥 Configurar Videos

### Opción A: Cloudflare Tunnel (URL permanente - RECOMENDADO)

```powershell
# Instalar
choco install cloudflared

# Configurar (una sola vez)
cloudflared tunnel login
cloudflared tunnel create videos-elearning

# Iniciar
cloudflared tunnel run videos-elearning
```

### Opción B: Usar localhost (solo para desarrollo)

1. Copia videos a `C:\Videos\Cursos\`
2. Accede a http://localhost:8080/api/videos

---

## ❓ Problemas comunes

**"Cannot connect to PostgreSQL"**
```powershell
# Verificar que esté corriendo
Get-Service postgresql*

# Iniciar
Start-Service postgresql-x64-15
```

**"Port already in use"**
```powershell
# Ver qué usa el puerto
netstat -ano | findstr :5000

# Matar proceso
taskkill /PID NUMERO_PID /F
```

---

## 📚 Documentación completa

- [Instalación detallada](INSTALACION.md)
- [README principal](../README.md)

¡Listo para desarrollar! 🚀
