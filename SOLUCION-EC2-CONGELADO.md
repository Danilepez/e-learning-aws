# 🆘 SOLUCIÓN: EC2 CONGELADO DURANTE npm run build

## ❌ PROBLEMA
La instancia EC2 se congeló al ejecutar `npm run build` porque consume demasiada RAM.

## ✅ SOLUCIÓN 1: REINICIAR INSTANCIA (Mantiene IP Elástica)

### Paso 1: Reiniciar desde AWS Console

1. Ve a **AWS Console** → **EC2** → **Instances**
2. Selecciona tu instancia `elearning-plataforma`
3. Click en **Instance state** → **Reboot instance**
4. Espera 2-3 minutos

**✅ TU IP ELÁSTICA 3.133.208.222 SE MANTIENE**

### Paso 2: Reconectar por SSH

```powershell
ssh -i "C:\Users\tuusuario\Downloads\elearning-key.pem" ubuntu@3.133.208.222
```

### Paso 3: Construir el Frontend EN TU PC LOCAL (No en EC2)

En lugar de hacer el build en EC2, hazlo en tu PC y sube solo los archivos compilados:

**EN TU PC LOCAL (Windows):**

```powershell
# Navegar al frontend
cd "C:\Dani\UPB\Sexto Semestre\Aplicaciones con Redes\Plataforma eLearning\frontend"

# Crear .env.production con la IP correcta
@"
VITE_API_URL=http://3.133.208.222:5000
VITE_VIDEO_SERVER_URL=http://localhost:8080
"@ | Out-File -FilePath .env.production -Encoding utf8

# Construir (esto lo hace tu PC, no EC2)
npm run build

# Comprimir la carpeta dist
Compress-Archive -Path .\dist\* -DestinationPath dist.zip -Force
```

### Paso 4: Subir el build a EC2 con SCP

```powershell
# Subir el archivo comprimido a EC2
scp -i "C:\Users\tuusuario\Downloads\elearning-key.pem" dist.zip ubuntu@3.133.208.222:/home/ubuntu/
```

### Paso 5: Descomprimir en EC2

```bash
# En EC2 (después de SSH)
cd /home/ubuntu/plataforma-elearning/frontend

# Crear carpeta dist si no existe
mkdir -p dist

# Descomprimir
unzip ~/dist.zip -d dist/

# Verificar archivos
ls -la dist/

# Reiniciar Nginx
sudo systemctl restart nginx
```

---

## ✅ SOLUCIÓN 2: CONSTRUIR LOCALMENTE Y SUBIR POR GIT (Más Fácil)

### Paso 1: Construir en tu PC

```powershell
cd "C:\Dani\UPB\Sexto Semestre\Aplicaciones con Redes\Plataforma eLearning\frontend"

# Crear .env.production
@"
VITE_API_URL=http://3.133.208.222:5000
VITE_VIDEO_SERVER_URL=http://localhost:8080
"@ | Out-File -FilePath .env.production -Encoding utf8

# Construir
npm run build
```

### Paso 2: Modificar .gitignore para incluir dist (temporalmente)

```powershell
# Editar .gitignore del frontend
code frontend\.gitignore

# COMENTAR la línea de dist:
# dist
# dist-ssr
```

### Paso 3: Subir a GitHub

```powershell
cd "C:\Dani\UPB\Sexto Semestre\Aplicaciones con Redes\Plataforma eLearning"

git add .
git commit -m "Add production build"
git push origin main
```

### Paso 4: Descargar en EC2

```bash
# En EC2
cd /home/ubuntu/plataforma-elearning
git pull origin main

# Reiniciar Nginx
sudo systemctl restart nginx
```

---

## ✅ SOLUCIÓN 3: AUMENTAR SWAP (Si quieres construir en EC2)

Si quieres seguir construyendo en EC2, necesitas agregar memoria SWAP:

```bash
# En EC2 (después de reiniciar y reconectar)
# Crear archivo SWAP de 2GB
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Hacer permanente
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Verificar SWAP activo
free -h

# Ahora sí, intentar el build
cd /home/ubuntu/plataforma-elearning/frontend
npm run build
```

---

## 🎯 RECOMENDACIÓN: USA SOLUCIÓN 1 (Construir Localmente)

**Ventajas:**
- ✅ Más rápido (tu PC es más potente)
- ✅ No congela EC2
- ✅ No consume recursos de producción
- ✅ La IP elástica nunca se pierde

**La IP elástica 3.133.208.222 SIEMPRE se mantiene mientras:**
- No la desasocies manualmente
- No termines (elimines) la instancia EC2
- Puedes reiniciar cuantas veces quieras

---

## 📋 CHECKLIST RÁPIDO

1. [ ] Reiniciar instancia en AWS Console
2. [ ] Construir frontend en tu PC local (`npm run build`)
3. [ ] Subir dist.zip con SCP O hacer commit y push a GitHub
4. [ ] En EC2: descomprimir o hacer `git pull`
5. [ ] Reiniciar Nginx: `sudo systemctl restart nginx`
6. [ ] Visitar: http://3.133.208.222

---

## ⚠️ SI LA INSTANCIA NO RESPONDE DESPUÉS DE 10 MINUTOS

Si después de reiniciar sigue sin responder:

1. **Detener instancia** (Stop, NO Terminate)
2. **Iniciar instancia** (Start)
3. La IP elástica se mantiene automáticamente
4. Reconectar por SSH

**NUNCA hagas "Terminate instance" o perderás todo.**

---

¿Cuál solución prefieres? Te recomiendo la **Solución 1** (construir localmente y subir con SCP).
