# 🚀 GUÍA COMPLETA DE DESPLIEGUE EN AWS EC2

## PASO 1: PREPARAR REPOSITORIO GIT

### 1.1 Crear repositorio en GitHub
```bash
# Ya lo tienes creado: https://github.com/Danilepez/e-learning-aws
```

### 1.2 Subir código actualizado
```powershell
cd "C:\Dani\UPB\Sexto Semestre\Aplicaciones con Redes\Plataforma eLearning"

# Agregar todos los cambios
git add .

# Commit con mensaje descriptivo
git commit -m "Update: Credenciales actualizadas y listo para producción"

# Subir a GitHub
git push origin main
```

---

## PASO 2: CONFIGURAR AWS EC2

### 2.1 Lanzar Instancia EC2

1. **Acceder a AWS Console**: https://console.aws.amazon.com
2. **Ir a EC2** → Click en "Launch Instance"
3. **Configurar la instancia**:

   **Name:** `elearning-plataforma`
   
   **AMI (Sistema Operativo):** Ubuntu Server 22.04 LTS (Free tier eligible)
   
   **Instance type:** `t2.small` (2 vCPU, 2 GB RAM)
   - ⚠️ **IMPORTANTE**: t2.micro (1GB RAM) NO es suficiente para Node.js + React
   
   **Key pair:** 
   - Click "Create new key pair"
   - Name: `elearning-key`
   - Type: RSA
   - Format: `.pem`
   - **DESCARGAR Y GUARDAR** en un lugar seguro (ej: `C:\Users\tuusuario\Downloads\elearning-key.pem`)
   
   **Network settings:**
   - ✅ Allow SSH traffic from: Anywhere (0.0.0.0/0)
   - ✅ Allow HTTP traffic from the internet
   - ✅ Allow HTTPS traffic from the internet
   
   **Configure storage:** 20 GB gp3 SSD
   
4. **Click "Launch instance"**

### 2.2 Asociar IP Elástica (Ya tienes 3.133.208.222)

1. En EC2 Dashboard → **Elastic IPs** (menú izquierdo)
2. Selecciona tu IP elástica `3.133.208.222`
3. **Actions** → **Associate Elastic IP address**
4. Selecciona la instancia `elearning-plataforma`
5. Click **Associate**

### 2.3 Configurar Security Group

1. En EC2 → **Security Groups**
2. Selecciona el security group de tu instancia
3. **Edit inbound rules** → **Add rule**:

| Type       | Protocol | Port Range | Source    | Description           |
|------------|----------|------------|-----------|-----------------------|
| SSH        | TCP      | 22         | 0.0.0.0/0 | SSH access            |
| HTTP       | TCP      | 80         | 0.0.0.0/0 | Frontend              |
| HTTPS      | TCP      | 443        | 0.0.0.0/0 | HTTPS (futuro)        |
| Custom TCP | TCP      | 5000       | 0.0.0.0/0 | Backend API           |

4. **Save rules**

---

## PASO 3: CONECTAR POR SSH

### 3.1 Desde Windows PowerShell

```powershell
# Cambiar permisos del archivo .pem (solo la primera vez)
icacls "C:\Users\tuusuario\Downloads\elearning-key.pem" /inheritance:r
icacls "C:\Users\tuusuario\Downloads\elearning-key.pem" /grant:r "%username%:R"

# Conectar a EC2
ssh -i "C:\Users\tuusuario\Downloads\elearning-key.pem" ubuntu@3.133.208.222
```

Si te pide confirmación, escribe `yes` y presiona Enter.

---

## PASO 4: INSTALAR DEPENDENCIAS EN EC2

### 4.1 Actualizar el sistema

```bash
sudo apt update && sudo apt upgrade -y
```

### 4.2 Instalar Node.js 18

```bash
# Instalar Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar instalación
node -v    # Debe mostrar v18.x.x
npm -v     # Debe mostrar 9.x.x o superior
```

### 4.3 Instalar PM2 (Gestor de procesos)

```bash
sudo npm install -g pm2
pm2 -v     # Verificar instalación
```

### 4.4 Instalar Git

```bash
sudo apt install -y git
git --version
```

### 4.5 Instalar Nginx

```bash
sudo apt install -y nginx
sudo systemctl status nginx    # Debe estar "active (running)"
```

---

## PASO 5: CLONAR Y CONFIGURAR PROYECTO

### 5.1 Clonar repositorio

```bash
cd /home/ubuntu
git clone https://github.com/Danilepez/e-learning-aws.git plataforma-elearning
cd plataforma-elearning
```

### 5.2 Configurar Backend

```bash
cd backend

# Instalar dependencias
npm install

# Crear archivo .env
nano .env
```

**Contenido del archivo .env** (copia esto):

```env
# Base de datos (USAR TUS CREDENCIALES REALES)
DB_HOST=elearning-dani-db.c54qq8k0wsin.us-east-2.rds.amazonaws.com
DB_PORT=5432
DB_NAME=elearning-dani-db
DB_USER=tu_usuario_rds
DB_PASSWORD=tu_password_rds

# JWT
JWT_SECRET=tu_clave_secreta_muy_segura_cambiar_esto_12345
JWT_EXPIRES_IN=7d

# Servidor
PORT=5000
NODE_ENV=production

# Video Server (Cloudflare Tunnel - configurar en PASO 8)
VIDEO_SERVER_URL=http://localhost:8080
```

**Para guardar en nano:**
1. Presiona `Ctrl + O` (guardar)
2. Presiona `Enter` (confirmar nombre)
3. Presiona `Ctrl + X` (salir)

### 5.3 Iniciar Backend con PM2

```bash
# Desde /home/ubuntu/plataforma-elearning/backend
pm2 start src/server.js --name backend

# Ver logs
pm2 logs backend

# Debes ver: "✅ Servidor listo para recibir peticiones"
```

### 5.4 Configurar inicio automático de PM2

```bash
pm2 startup
# Copia y ejecuta el comando que te muestra

pm2 save
```

---

## PASO 6: CONFIGURAR FRONTEND

### 6.1 Crear archivo .env.production

```bash
cd /home/ubuntu/plataforma-elearning/frontend

# Crear archivo de configuración de producción
nano .env.production
```

**Contenido del archivo .env.production**:

```env
VITE_API_URL=http://3.133.208.222:5000
VITE_VIDEO_SERVER_URL=http://localhost:8080
```

**Guardar:** `Ctrl + O`, `Enter`, `Ctrl + X`

### 6.2 Instalar dependencias y construir

```bash
# Instalar dependencias
npm install

# Construir para producción (tarda 1-2 minutos)
npm run build

# Verificar que se creó la carpeta dist
ls -la dist/
```

---

## PASO 7: CONFIGURAR NGINX

### 7.1 Crear configuración de Nginx

```bash
sudo nano /etc/nginx/sites-available/elearning
```

**Contenido del archivo** (copia esto):

```nginx
server {
    listen 80;
    server_name 3.133.208.222;

    # Frontend - Servir archivos estáticos de React
    location / {
        root /home/ubuntu/plataforma-elearning/frontend/dist;
        try_files $uri $uri/ /index.html;
        
        # Headers para SPA
        add_header Cache-Control "no-cache";
    }

    # Backend API - Proxy reverso
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Guardar:** `Ctrl + O`, `Enter`, `Ctrl + X`

### 7.2 Activar configuración

```bash
# Crear enlace simbólico
sudo ln -s /etc/nginx/sites-available/elearning /etc/nginx/sites-enabled/

# Eliminar configuración por defecto
sudo rm /etc/nginx/sites-enabled/default

# Verificar configuración
sudo nginx -t

# Debe mostrar: "syntax is ok" y "test is successful"

# Reiniciar Nginx
sudo systemctl restart nginx
```

---

## PASO 8: VERIFICAR FUNCIONAMIENTO

### 8.1 Verificar Backend

```bash
# Ver logs de PM2
pm2 logs backend

# Verificar endpoint de salud
curl http://localhost:5000/health

# Debe responder: {"status":"OK","timestamp":"..."}
```

### 8.2 Verificar Frontend

**Desde tu navegador local:**
1. Abre: `http://3.133.208.222`
2. Debes ver la página de login
3. **Prueba credenciales:**
   - Email: `student@elearning.com`
   - Password: `123456`

---

## PASO 9: CONFIGURAR CLOUDFLARE TUNNEL (Videos)

### 9.1 Instalar Cloudflare Tunnel en tu PC Windows

```powershell
# En tu PC local (Windows), no en EC2
# Instalar con Chocolatey
choco install cloudflared

# O descargar desde: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/
```

### 9.2 Autenticar con Cloudflare

```powershell
# Esto abre el navegador para autenticarte
cloudflared tunnel login
```

### 9.3 Crear Túnel

```powershell
# Crear túnel llamado "elearning-videos"
cloudflared tunnel create elearning-videos

# Esto genera un archivo de credenciales en:
# C:\Users\tuusuario\.cloudflared\
```

### 9.4 Configurar Túnel

```powershell
# Crear archivo de configuración
notepad C:\Users\tuusuario\.cloudflared\config.yml
```

**Contenido del config.yml**:

```yaml
tunnel: elearning-videos
credentials-file: C:\Users\tuusuario\.cloudflared\TUNNEL-ID.json

ingress:
  - hostname: videos-elearning.tudominio.com
    service: http://localhost:8080
  - service: http_status:404
```

**⚠️ NOTA**: Reemplaza `TUNNEL-ID.json` con el nombre real del archivo que se generó.

### 9.5 Crear ruta DNS

```powershell
# Esto crea un subdominio automáticamente
cloudflared tunnel route dns elearning-videos videos-elearning.tudominio.com
```

**Alternativa si NO tienes dominio:**

Usa el dominio temporal de Cloudflare (funciona sin configurar DNS):

```powershell
# Simplemente ejecuta el túnel sin DNS:
cloudflared tunnel run elearning-videos
```

Cloudflare te dará una URL automática tipo:
`https://random-words-random.trycloudflare.com`

### 9.6 Iniciar Servidor de Videos (PC Local)

```powershell
# Terminal 1: Servidor de videos
cd "C:\Dani\UPB\Sexto Semestre\Aplicaciones con Redes\Plataforma eLearning\video-server"
npm start
```

### 9.7 Iniciar Túnel (PC Local)

```powershell
# Terminal 2: Cloudflare Tunnel
cloudflared tunnel run elearning-videos
```

Copia la URL que te da (ej: `https://xxx.trycloudflare.com`)

### 9.8 Actualizar Backend con URL del Túnel

```bash
# En EC2, editar .env del backend
cd /home/ubuntu/plataforma-elearning/backend
nano .env
```

**Actualizar esta línea:**
```env
VIDEO_SERVER_URL=https://xxx.trycloudflare.com
```

**Reiniciar backend:**
```bash
pm2 restart backend
```

### 9.9 Instalar como Servicio de Windows (Opcional)

Para que el túnel se inicie automáticamente al arrancar Windows:

```powershell
# Como Administrador
cloudflared service install
cloudflared service start
```

---

## PASO 10: POBLAR BASE DE DATOS (Si está vacía)

```bash
# En EC2
cd /home/ubuntu/plataforma-elearning/backend
node seed.js

# Debe mostrar:
# 🎉 ¡Seed completado exitosamente!
# - 5 cursos creados
# - 13 módulos creados
# - 3 inscripciones creadas
```

---

## ✅ VERIFICACIÓN FINAL

### Checklist de Funcionalidad

- [ ] **Frontend carga**: `http://3.133.208.222` muestra login
- [ ] **Login funciona**: Puedes iniciar sesión con credenciales
- [ ] **Admin panel**: `admin@elearning.com` / `123456` accede a gestión de usuarios
- [ ] **Teacher panel**: `teacher@elearning.com` / `123456` puede crear cursos
- [ ] **Student panel**: `student@elearning.com` / `123456` ve "Mis Cursos"
- [ ] **Videos funcionan**: Al ver un curso, los videos se reproducen
- [ ] **Progreso se guarda**: La barra de progreso avanza al ver videos
- [ ] **Backend API**: `http://3.133.208.222:5000/health` responde OK

### Comandos Útiles de Monitoreo

```bash
# Ver logs del backend
pm2 logs backend

# Ver estado de PM2
pm2 status

# Ver logs de Nginx
sudo tail -f /var/log/nginx/error.log

# Reiniciar servicios
pm2 restart backend
sudo systemctl restart nginx
```

---

## 🎯 RESUMEN DE URLs

| Componente         | URL                                    |
|--------------------|----------------------------------------|
| **Frontend**       | http://3.133.208.222                   |
| **Backend API**    | http://3.133.208.222:5000              |
| **Health Check**   | http://3.133.208.222:5000/health       |
| **Videos Server**  | https://xxx.trycloudflare.com (túnel)  |
| **SSH**            | ssh ubuntu@3.133.208.222               |

## 🔐 CREDENCIALES DE ACCESO

| Rol            | Email                      | Password |
|----------------|----------------------------|----------|
| Estudiante     | student@elearning.com      | 123456   |
| Profesor       | teacher@elearning.com      | 123456   |
| Administrador  | admin@elearning.com        | 123456   |

---

## 🐛 SOLUCIÓN DE PROBLEMAS COMUNES

### Error: "Cannot connect to database"
```bash
# Verificar que RDS esté accesible desde EC2
# Revisar Security Group de RDS (puerto 5432 abierto)
# Verificar credenciales en .env
```

### Error: Frontend muestra página en blanco
```bash
# Verificar que el build se completó
ls -la /home/ubuntu/plataforma-elearning/frontend/dist/

# Verificar logs de Nginx
sudo tail -f /var/log/nginx/error.log

# Reconstruir frontend
cd /home/ubuntu/plataforma-elearning/frontend
npm run build
sudo systemctl restart nginx
```

### Error: Videos no cargan
```bash
# En tu PC local:
# 1. Verificar que video-server esté corriendo (puerto 8080)
# 2. Verificar que Cloudflare tunnel esté activo
# 3. Verificar que VIDEO_SERVER_URL en backend .env apunte a la URL del túnel
```

### Backend no responde
```bash
pm2 restart backend
pm2 logs backend --lines 50
```

---

## 🎓 PARA ENTREGAR AL PROFESOR

**Enviar en el correo:**

```
Asunto: Entrega Proyecto Plataforma eLearning - [Tu Nombre]

URL de Acceso: http://3.133.208.222

Credenciales de Prueba:
- Estudiante: student@elearning.com / 123456
- Profesor: teacher@elearning.com / 123456
- Administrador: admin@elearning.com / 123456

Adjuntos:
- MANUAL.pdf (Manual completo de usuario y configuración)
- Link al repositorio: https://github.com/Danilepez/e-learning-aws

La plataforma está completamente funcional con:
✓ Gestión de usuarios (Admin)
✓ Creación de cursos con módulos (Profesor)
✓ Reproducción de videos con progreso (Estudiante)
✓ Base de datos PostgreSQL en AWS RDS
✓ Desplegado en AWS EC2 con IP elástica
```

---

## 📚 RECURSOS ADICIONALES

- **Manual completo**: `MANUAL.pdf` (en tu proyecto)
- **Deployment guide**: `DEPLOYMENT.md` (en tu proyecto)
- **Repositorio GitHub**: https://github.com/Danilepez/e-learning-aws

---

**¡LISTO PARA PRODUCCIÓN!** 🚀
