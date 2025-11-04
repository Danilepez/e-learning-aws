# 📦 GUÍA DE DESPLIEGUE EN AWS EC2

## 🎯 PASO 1: PREPARAR REPOSITORIO GIT

### 1.1 Crear repositorio en GitHub
```bash
# Ve a https://github.com/new
# Nombre: plataforma-elearning
# Privado o Público (tu elección)
# NO inicialices con README
```

### 1.2 Subir código a GitHub
```powershell
cd "C:\Dani\UPB\Sexto Semestre\Aplicaciones con Redes\Plataforma eLearning"

# Agregar todos los archivos
git add .

# Hacer commit
git commit -m "Initial commit - eLearning platform con módulos"

# Agregar remote (REEMPLAZA con tu URL)
git remote add origin https://github.com/TU-USUARIO/plataforma-elearning.git

# Subir a GitHub
git branch -M main
git push -u origin main
```

---

## 🚀 PASO 2: LANZAR INSTANCIA EC2

### 2.1 Acceder a AWS Console
- Ve a https://aws.amazon.com/console/
- Login con tu cuenta
- Región: **us-east-2 (Ohio)** - MISMO REGION QUE TU RDS

### 2.2 Lanzar EC2
1. Busca "EC2" en el buscador
2. Click en "Launch Instance"
3. **Configuración:**
   - **Name**: `elearning-server`
   - **AMI**: Ubuntu Server 22.04 LTS (Free tier eligible)
   - **Instance type**: `t2.small` o `t2.medium` (recomendado para backend+frontend)
   - **Key pair**: 
     - Click "Create new key pair"
     - Name: `elearning-key`
     - Type: RSA
     - Format: `.pem`
     - **DESCARGA** y guarda en lugar seguro
   - **Network settings**:
     - Click "Edit"
     - Allow SSH traffic from: "My IP"
     - Allow HTTP traffic: ✅
     - Allow HTTPS traffic: ✅
   - **Advanced details** → User data (opcional):
     ```bash
     #!/bin/bash
     apt update
     apt upgrade -y
     ```
4. Click "Launch instance"
5. Espera 2-3 minutos

### 2.3 Configurar Security Group
1. En EC2 Dashboard, click en "Security Groups"
2. Encuentra el security group de tu instancia
3. Click "Edit inbound rules"
4. **Agregar reglas:**
   - Type: Custom TCP, Port: **5000**, Source: 0.0.0.0/0 (Backend)
   - Type: Custom TCP, Port: **5173**, Source: 0.0.0.0/0 (Frontend dev - temporal)
   - Type: Custom TCP, Port: **80**, Source: 0.0.0.0/0 (HTTP)
   - Type: Custom TCP, Port: **443**, Source: 0.0.0.0/0 (HTTPS)
5. Save rules

---

## 🔌 PASO 3: CONECTARSE A EC2

### 3.1 Obtener IP pública
- En EC2 Dashboard → Instances
- Selecciona tu instancia
- Copia la **Public IPv4 address** (ejemplo: 3.145.123.45)

### 3.2 Conectarse por SSH (desde Windows)
```powershell
# Cambiar permisos del archivo .pem (solo primera vez)
icacls C:\Users\TU_USUARIO\Downloads\elearning-key.pem /inheritance:r
icacls C:\Users\TU_USUARIO\Downloads\elearning-key.pem /grant:r "%USERNAME%:R"

# Conectarse (REEMPLAZA con tu IP)
ssh -i C:\Users\TU_USUARIO\Downloads\elearning-key.pem ubuntu@3.145.123.45
```

**Alternativa: Usar PuTTY**
1. Descarga PuTTY: https://www.putty.org/
2. Descarga PuTTYgen
3. Convierte .pem a .ppk con PuTTYgen
4. Conecta con PuTTY usando el .ppk

---

## 📦 PASO 4: INSTALAR DEPENDENCIAS EN EC2

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar instalación
node -v  # Debe mostrar v18.x.x
npm -v   # Debe mostrar 9.x.x

# Instalar PM2 (gestor de procesos)
sudo npm install -g pm2

# Instalar Git
sudo apt install -y git

# Instalar Nginx
sudo apt install -y nginx
```

---

## 🎨 PASO 5: CLONAR Y CONFIGURAR PROYECTO

### 5.1 Clonar repositorio
```bash
cd /home/ubuntu
git clone https://github.com/TU-USUARIO/plataforma-elearning.git
cd plataforma-elearning
```

### 5.2 Configurar Backend
```bash
cd backend
npm install

# Crear archivo .env
nano .env
```

**Contenido del .env (COPIA Y PEGA):**
```env
# Base de datos (TU RDS EXISTENTE)
DB_HOST=elearning-dani-db.c54qq8k0wsin.us-east-2.rds.amazonaws.com
DB_PORT=5432
DB_NAME=elearning-dani-db
DB_USER=root
DB_PASSWORD=TU_PASSWORD_AQUI

# JWT
JWT_SECRET=7cafece3d95cd41742550dcbcd16d640
JWT_EXPIRES_IN=7d

# Server
PORT=5000
NODE_ENV=production

# URLs (ACTUALIZAR después con IP pública)
VIDEO_SERVER_URL=http://TU-IP-PUBLICA:8080
FRONTEND_URL=http://TU-IP-PUBLICA

# CORS
CORS_ORIGINS=http://TU-IP-PUBLICA,http://localhost:5173
```

**Guardar:** Ctrl+O, Enter, Ctrl+X

### 5.3 Iniciar Backend con PM2
```bash
pm2 start src/server.js --name backend
pm2 save
pm2 startup
# Copia y ejecuta el comando que te da
```

### 5.4 Configurar Frontend
```bash
cd /home/ubuntu/plataforma-elearning/frontend
npm install

# Crear archivo .env
nano .env
```

**Contenido del .env:**
```env
VITE_API_URL=http://TU-IP-PUBLICA:5000/api
VITE_VIDEO_SERVER_URL=http://TU-IP-PUBLICA:8080
```

**Guardar:** Ctrl+O, Enter, Ctrl+X

### 5.5 Build del frontend
```bash
npm run build
# Esto crea la carpeta dist/
```

---

## 🌐 PASO 6: CONFIGURAR NGINX

### 6.1 Crear configuración de Nginx
```bash
sudo nano /etc/nginx/sites-available/elearning
```

**Contenido (COPIA Y PEGA, REEMPLAZA TU-IP-PUBLICA):**
```nginx
server {
    listen 80;
    server_name TU-IP-PUBLICA;

    # Frontend (servir archivos estáticos)
    location / {
        root /home/ubuntu/plataforma-elearning/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API (proxy)
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

**Guardar:** Ctrl+O, Enter, Ctrl+X

### 6.2 Activar configuración
```bash
# Crear symlink
sudo ln -s /etc/nginx/sites-available/elearning /etc/nginx/sites-enabled/

# Eliminar configuración default
sudo rm /etc/nginx/sites-enabled/default

# Verificar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

---

## ✅ PASO 7: VERIFICAR FUNCIONAMIENTO

### 7.1 Verificar servicios
```bash
# Ver estado de PM2
pm2 status

# Ver logs del backend
pm2 logs backend

# Ver estado de Nginx
sudo systemctl status nginx
```

### 7.2 Probar en navegador
1. Abre: `http://TU-IP-PUBLICA`
2. Deberías ver el login de la plataforma
3. Login: `student@elearning.com` / `password123`

---

## 🎥 PASO 8: CLOUDFLARE TUNNEL PARA VIDEOS

### 8.1 Instalar Cloudflared en tu PC (Windows)
```powershell
# Opción 1: Con Chocolatey
choco install cloudflared

# Opción 2: Descargar manualmente
# https://github.com/cloudflare/cloudflared/releases
# Descargar cloudflared-windows-amd64.exe
# Renombrar a cloudflared.exe
# Mover a C:\Windows\System32\
```

### 8.2 Login en Cloudflare
```powershell
cloudflared tunnel login
# Se abrirá navegador, selecciona tu dominio (o crea cuenta gratis en Cloudflare)
```

### 8.3 Crear Tunnel
```powershell
cloudflared tunnel create elearning-videos
# Guarda el TUNNEL_ID que te da
```

### 8.4 Crear archivo de configuración
```powershell
# Crear carpeta
mkdir C:\Users\TU_USUARIO\.cloudflared

# Crear archivo config.yml
notepad C:\Users\TU_USUARIO\.cloudflared\config.yml
```

**Contenido del config.yml:**
```yaml
tunnel: TU-TUNNEL-ID
credentials-file: C:\Users\TU_USUARIO\.cloudflared\TU-TUNNEL-ID.json

ingress:
  - hostname: videos.tudominio.com
    service: http://localhost:8080
  - service: http_status:404
```

### 8.5 Configurar DNS
```powershell
cloudflared tunnel route dns elearning-videos videos.tudominio.com
```

### 8.6 Iniciar Tunnel como servicio
```powershell
# Instalar como servicio de Windows
cloudflared service install

# Iniciar servicio
cloudflared service start

# Verificar
cloudflared service status
```

### 8.7 Actualizar configuración en EC2
```bash
# En EC2, editar backend .env
cd /home/ubuntu/plataforma-elearning/backend
nano .env

# Cambiar VIDEO_SERVER_URL:
VIDEO_SERVER_URL=https://videos.tudominio.com

# Reiniciar backend
pm2 restart backend
```

---

## 🔄 COMANDOS ÚTILES

### En EC2:
```bash
# Ver logs backend
pm2 logs backend

# Reiniciar backend
pm2 restart backend

# Actualizar código desde Git
cd /home/ubuntu/plataforma-elearning
git pull
cd backend && pm2 restart backend
cd ../frontend && npm run build && sudo systemctl restart nginx

# Ver logs de Nginx
sudo tail -f /var/log/nginx/error.log
```

### En tu PC (Tunnel):
```powershell
# Ver estado
cloudflared service status

# Reiniciar
cloudflared service stop
cloudflared service start

# Ver logs
cloudflared service logs
```

---

## 🎯 CHECKLIST FINAL

- [ ] Repositorio en GitHub creado y código subido
- [ ] EC2 lanzada en us-east-2 (Ohio)
- [ ] Security Groups configurados (puertos 80, 443, 5000)
- [ ] SSH funcionando
- [ ] Node.js, PM2, Nginx instalados
- [ ] Backend corriendo con PM2
- [ ] Frontend buildeado
- [ ] Nginx configurado y funcionando
- [ ] Cloudflare Tunnel instalado en PC
- [ ] Video server corriendo en PC (localhost:8080)
- [ ] Tunnel conectando PC → EC2
- [ ] Backend .env actualizado con URL del tunnel
- [ ] Login funcional desde internet

---

## 🆘 TROUBLESHOOTING

### Backend no arranca:
```bash
pm2 logs backend
# Ver el error específico
```

### Nginx error:
```bash
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

### Videos no cargan:
- Verificar que video-server esté corriendo en PC: http://localhost:8080/health
- Verificar tunnel: `cloudflared service status`
- Verificar URL en backend .env

### Base de datos no conecta:
- Verificar Security Group de RDS (debe permitir 5432 desde EC2)
- Verificar credenciales en .env

---

## 📝 NOTAS IMPORTANTES

1. **IP Elástica**: Considera usar una IP elástica en EC2 para que no cambie al reiniciar
2. **Dominio**: Para producción, configura un dominio real en lugar de IP
3. **HTTPS**: Usa Let's Encrypt con Certbot para SSL/TLS
4. **Backups**: Configura snapshots automáticos de RDS y EC2
5. **Monitoreo**: Usa CloudWatch para logs y alertas

---

¿TODO LISTO? ¡VAMOS A DESPLEGAR! 🚀
