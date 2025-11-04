# 🔍 DIAGNÓSTICO ERROR 500 - Nginx

## ❌ Error: 500 Internal Server Error nginx/1.24.0 (Ubuntu)

Este error significa que **Nginx está funcionando PERO el backend no responde** o hay un problema con los archivos del frontend.

---

## 📋 PASOS DE DIAGNÓSTICO

### PASO 1: Conectar por SSH

```powershell
ssh -i "C:\Users\tuusuario\Downloads\elearning-key.pem" ubuntu@3.133.208.222
```

---

### PASO 2: Verificar Estado del Backend (PM2)

```bash
# Ver estado de PM2
pm2 status

# Si está "stopped" o no aparece, iniciarlo:
pm2 start src/server.js --name backend

# Ver logs del backend
pm2 logs backend --lines 50

# Ver errores específicos
pm2 logs backend --err
```

**¿Qué buscar?**
- ✅ Estado debe ser "online" (verde)
- ❌ Si está "stopped", "errored" o "not found" → hay problema

---

### PASO 3: Verificar que el Backend Responda

```bash
# Probar endpoint de salud
curl http://localhost:5000/health

# Debe responder: {"status":"OK","timestamp":"..."}
```

**Si NO responde:**

```bash
# Ver logs completos
pm2 logs backend

# Errores comunes:
# 1. "Cannot connect to database" → Problema con RDS
# 2. "Port 5000 already in use" → Puerto ocupado
# 3. "MODULE_NOT_FOUND" → Faltan dependencias
```

---

### PASO 4: Verificar Archivos del Frontend

```bash
# Verificar que exista la carpeta dist
ls -la /home/ubuntu/plataforma-elearning/frontend/dist/

# Debe mostrar:
# - index.html
# - assets/
# - vite.svg
```

**Si la carpeta está VACÍA o NO existe:**

Necesitas construir el frontend (hazlo en tu PC local):

---

### PASO 5: Ver Logs de Nginx

```bash
# Ver errores de Nginx
sudo tail -f /var/log/nginx/error.log

# Ver accesos
sudo tail -f /var/log/nginx/access.log
```

**Errores comunes en logs:**
- `connect() failed (111: Connection refused)` → Backend no está corriendo
- `No such file or directory` → Falta carpeta dist
- `Permission denied` → Problema de permisos

---

## 🔧 SOLUCIONES SEGÚN EL PROBLEMA

### Problema 1: Backend NO está corriendo

```bash
cd /home/ubuntu/plataforma-elearning/backend

# Verificar que exista .env
cat .env

# Si no existe, créalo:
nano .env
```

**Contenido mínimo del .env:**
```env
DB_HOST=elearning-dani-db.c54qq8k0wsin.us-east-2.rds.amazonaws.com
DB_PORT=5432
DB_NAME=elearning-dani-db
DB_USER=tu_usuario_rds
DB_PASSWORD=tu_password_rds

JWT_SECRET=clave_secreta_muy_segura_123456
JWT_EXPIRES_IN=7d

PORT=5000
NODE_ENV=production

VIDEO_SERVER_URL=http://localhost:8080
```

**Iniciar backend:**
```bash
pm2 start src/server.js --name backend
pm2 save
```

---

### Problema 2: Falta carpeta dist del Frontend

**Construir en tu PC y subir:**

```powershell
# EN TU PC LOCAL
cd "C:\Dani\UPB\Sexto Semestre\Aplicaciones con Redes\Plataforma eLearning\frontend"

# Asegúrate de tener .env.production
@"
VITE_API_URL=http://3.133.208.222:5000
VITE_VIDEO_SERVER_URL=http://localhost:8080
"@ | Out-File -FilePath .env.production -Encoding utf8

# Construir
npm run build

# Verificar que se creó dist/
ls dist/

# Comprimir
Compress-Archive -Path .\dist\* -DestinationPath dist.zip -Force

# Subir a EC2
scp -i "C:\Users\tuusuario\Downloads\elearning-key.pem" dist.zip ubuntu@3.133.208.222:/home/ubuntu/
```

**En EC2, descomprimir:**
```bash
cd /home/ubuntu/plataforma-elearning/frontend
rm -rf dist/  # Eliminar dist viejo si existe
mkdir dist
cd dist
unzip ~/dist.zip
cd ..

# Verificar contenido
ls -la dist/

# Reiniciar Nginx
sudo systemctl restart nginx
```

---

### Problema 3: Configuración de Nginx Incorrecta

```bash
# Ver configuración actual
cat /etc/nginx/sites-available/elearning

# Debe tener esto:
```

```nginx
server {
    listen 80;
    server_name 3.133.208.222;

    # Frontend
    location / {
        root /home/ubuntu/plataforma-elearning/frontend/dist;
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache";
    }

    # Backend API
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

**Si está mal, editarlo:**
```bash
sudo nano /etc/nginx/sites-available/elearning

# Pegar la configuración de arriba
# Guardar: Ctrl+O, Enter, Ctrl+X

# Probar configuración
sudo nginx -t

# Si dice "syntax is ok", reiniciar:
sudo systemctl restart nginx
```

---

### Problema 4: Error de Base de Datos

```bash
# Ver logs del backend
pm2 logs backend

# Si ves "Cannot connect to database" o "ECONNREFUSED":
```

**Verificar Security Group de RDS:**
1. Ve a AWS Console → RDS → Tu base de datos
2. Click en el Security Group
3. **Inbound rules** debe tener:
   - Type: PostgreSQL
   - Port: 5432
   - Source: Security Group de tu EC2 (o 0.0.0.0/0 temporalmente)

**Verificar conectividad desde EC2:**
```bash
# Instalar cliente PostgreSQL
sudo apt install postgresql-client -y

# Intentar conectar
psql -h elearning-dani-db.c54qq8k0wsin.us-east-2.rds.amazonaws.com \
     -U tu_usuario \
     -d elearning-dani-db

# Si conecta, el problema es otro
# Si NO conecta, revisar Security Groups
```

---

## ✅ VERIFICACIÓN FINAL

Después de aplicar las soluciones:

```bash
# 1. Backend debe estar online
pm2 status
# Debe mostrar: backend | online | 0

# 2. Backend responde
curl http://localhost:5000/health
# Debe responder JSON

# 3. Nginx funciona
sudo nginx -t
# Debe decir: syntax is ok

# 4. Archivos frontend existen
ls /home/ubuntu/plataforma-elearning/frontend/dist/index.html
# Debe existir

# 5. Reiniciar todo
pm2 restart backend
sudo systemctl restart nginx
```

**Probar en navegador:**
- http://3.133.208.222 → Debe mostrar login
- http://3.133.208.222:5000/health → Debe mostrar JSON

---

## 🆘 SOLUCIÓN RÁPIDA (Si nada funciona)

```bash
# Reiniciar TODA la máquina
sudo reboot

# Espera 2-3 minutos, reconecta
ssh -i "ruta/a/key.pem" ubuntu@3.133.208.222

# Verificar que PM2 esté corriendo
pm2 status

# Si no hay procesos, revisar que PM2 esté configurado para auto-inicio:
pm2 startup
# Copia y ejecuta el comando que te muestra

# Iniciar backend
cd /home/ubuntu/plataforma-elearning/backend
pm2 start src/server.js --name backend
pm2 save

# Verificar Nginx
sudo systemctl status nginx
sudo systemctl restart nginx
```

---

## 📞 DAME ESTA INFORMACIÓN PARA AYUDARTE MEJOR

Ejecuta estos comandos y envíame la salida:

```bash
# 1. Estado de PM2
pm2 status

# 2. Últimas 20 líneas de logs del backend
pm2 logs backend --lines 20 --nostream

# 3. Últimas líneas de error de Nginx
sudo tail -20 /var/log/nginx/error.log

# 4. Verificar archivos frontend
ls -la /home/ubuntu/plataforma-elearning/frontend/dist/

# 5. Probar backend localmente
curl http://localhost:5000/health
```

Envíame esa información y te digo exactamente qué hacer.
