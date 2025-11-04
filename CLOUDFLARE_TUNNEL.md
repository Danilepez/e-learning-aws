# 🌐 Cloudflare Tunnel - Guía Completa

## ¿Qué es Cloudflare Tunnel?

**Cloudflare Tunnel** (antes llamado Argo Tunnel) es un servicio **100% GRATUITO** que:

✅ Expone tu servidor local (tu PC) a Internet sin abrir puertos  
✅ Genera una URL **permanente** que **nunca cambia**  
✅ Proporciona **HTTPS automático** (SSL gratis)  
✅ **Sin límites** de ancho de banda ni tiempo  
✅ **Más rápido** que ngrok (usa la red de Cloudflare)  

---

## 🆚 Cloudflare Tunnel vs ngrok

| Característica | Cloudflare Tunnel | ngrok (Free) |
|----------------|-------------------|--------------|
| **Precio** | 🟢 Gratis para siempre | 🟡 Gratis limitado |
| **URL permanente** | 🟢 Sí (videos.tudominio.com) | 🔴 No (cambia cada reinicio) |
| **Límite de tiempo** | 🟢 Ilimitado | 🟡 8 horas por sesión |
| **Ancho de banda** | 🟢 Ilimitado | 🟡 Limitado |
| **HTTPS** | 🟢 Automático | 🟢 Automático |
| **Dominios custom** | 🟢 Gratis | 🔴 Solo plan pago ($8/mes) |
| **Velocidad** | 🟢 Red CDN Cloudflare | 🟡 Estándar |

**Conclusión:** Cloudflare Tunnel es superior a ngrok para tu proyecto universitario.

---

## 🚀 Instalación (Windows)

### Opción 1: Chocolatey (Recomendado)

```powershell
# Instalar Chocolatey si no lo tienes
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Instalar cloudflared
choco install cloudflared
```

### Opción 2: Descarga directa

1. Ve a: https://github.com/cloudflare/cloudflared/releases
2. Descarga: `cloudflared-windows-amd64.exe`
3. Renombra a: `cloudflared.exe`
4. Muévelo a: `C:\Windows\System32\` (para usarlo desde cualquier terminal)

---

## ⚙️ Configuración Paso a Paso

### 1. Autenticación con Cloudflare

```powershell
cloudflared tunnel login
```

Esto abrirá tu navegador. **Selecciona un dominio** (si no tienes, puedes usar uno gratis como `.trycloudflare.com`).

### 2. Crear el Tunnel

```powershell
cloudflared tunnel create videos-elearning
```

Te devolverá algo como:
```
Tunnel credentials written to C:\Users\TuUsuario\.cloudflared\<TUNNEL_ID>.json
Created tunnel videos-elearning with id <TUNNEL_ID>
```

**Guarda ese TUNNEL_ID**, lo necesitarás.

### 3. Crear archivo de configuración

Crea el archivo: `C:\Users\TuUsuario\.cloudflared\config.yml`

```yaml
tunnel: <TUNNEL_ID>
credentials-file: C:\Users\TuUsuario\.cloudflared\<TUNNEL_ID>.json

ingress:
  - hostname: videos.tudominio.com
    service: http://localhost:8080
  - service: http_status:404
```

**Reemplaza:**
- `<TUNNEL_ID>` con el ID que te dio en el paso anterior
- `videos.tudominio.com` con tu subdominio deseado
- `8080` con el puerto de tu video-server

### 4. Crear registro DNS

```powershell
cloudflared tunnel route dns videos-elearning videos.tudominio.com
```

Esto crea automáticamente un registro DNS CNAME en Cloudflare.

### 5. Iniciar el Tunnel

```powershell
cloudflared tunnel run videos-elearning
```

**¡Listo!** Tu video-server ahora es accesible desde `https://videos.tudominio.com`

---

## 🔄 Autoinicio (Windows Service)

Para que el tunnel inicie automáticamente con Windows:

```powershell
# Instalar como servicio
cloudflared service install

# Iniciar servicio
net start cloudflared
```

Ahora el tunnel se ejecutará automáticamente cada vez que enciendas tu PC.

---

## 🎯 Configuración para tu proyecto

### En tu video-server

**No cambies nada.** El video-server sigue corriendo en `localhost:8080`.

### En tu frontend

Actualiza `frontend/.env`:

```bash
VITE_API_URL=http://localhost:5000/api
VITE_VIDEO_SERVER_URL=https://videos.tudominio.com  # ← URL de Cloudflare
```

### En tu backend

Actualiza `backend/.env`:

```bash
VIDEO_SERVER_URL=https://videos.tudominio.com  # ← URL de Cloudflare
ALLOWED_ORIGINS=http://localhost:5173,https://tu-frontend-en-aws.com
```

---

## ✅ Verificación

1. **Inicia tu video-server:**
   ```powershell
   cd video-server
   npm start
   ```

2. **Inicia el tunnel:**
   ```powershell
   cloudflared tunnel run videos-elearning
   ```

3. **Prueba la URL:**
   - Abre: `https://videos.tudominio.com/api/videos`
   - Deberías ver la lista de videos (JSON)

4. **Sube un video:**
   - Desde el panel de profesor: `/teacher/videos`
   - Debería subirse a tu PC local
   - Y ser accesible desde la URL de Cloudflare

---

## 🌍 Arquitectura Final

```
┌──────────────────────────────────────────────────────────────┐
│                         INTERNET                              │
└──────────────────────────────────────────────────────────────┘
              │                                    │
              │ HTTPS                              │ HTTPS
              ▼                                    ▼
     ┌─────────────────┐                ┌──────────────────┐
     │   AWS EC2       │                │ Cloudflare CDN   │
     │  (Backend API)  │                │  (Tunnel Proxy)  │
     │  Node.js + JWT  │                │  videos.tu.com   │
     └─────────────────┘                └──────────────────┘
              │                                    │
              │ SQL                                │ Encrypted
              ▼                                    │ Tunnel
     ┌─────────────────┐                          │
     │   AWS RDS       │                          ▼
     │   PostgreSQL    │              ┌────────────────────────┐
     │ (Usuarios, etc) │              │    TU PC LOCAL         │
     └─────────────────┘              │  Video Server :8080    │
                                      │  /videos/*.mp4         │
     ┌─────────────────┐              │                        │
     │   AWS EC2/S3    │              │  cloudflared.exe       │
     │  (Frontend)     │              │  (siempre encendido)   │
     │  React + MUI    │              └────────────────────────┘
     └─────────────────┘
```

**Ventajas:**
- ✅ Backend y Frontend en AWS (alta disponibilidad)
- ✅ Videos en tu PC (ahorro de costos S3)
- ✅ URL permanente para videos (no cambia nunca)
- ✅ HTTPS automático (sin configurar SSL)
- ✅ Sin abrir puertos en tu router
- ✅ Sin exponer tu IP pública

---

## 💡 Alternativa: trycloudflare.com (Sin dominio propio)

Si **no tienes un dominio**, puedes usar URLs temporales de Cloudflare:

```powershell
cloudflared tunnel --url http://localhost:8080
```

Te dará una URL como: `https://abc123def456.trycloudflare.com`

**Desventaja:** Esta URL **cambia cada vez** que reinicias el comando (igual que ngrok free).

**Solución:** Usa un dominio gratuito de Cloudflare o compra uno ($10/año en Namecheap).

---

## 🛠️ Comandos útiles

```powershell
# Ver tunnels creados
cloudflared tunnel list

# Ver información de un tunnel
cloudflared tunnel info videos-elearning

# Eliminar un tunnel
cloudflared tunnel delete videos-elearning

# Ver logs del tunnel
cloudflared tunnel --loglevel debug run videos-elearning

# Detener servicio Windows
net stop cloudflared

# Desinstalar servicio Windows
cloudflared service uninstall
```

---

## ❓ FAQ

### ¿Necesito dejar mi PC encendida 24/7?

**SÍ**, porque los videos están en tu PC. Opciones:
- Dejar PC encendida con ahorro de energía (pantalla apagada, disco activo)
- Usar una Raspberry Pi ($35) como servidor de videos
- Migrar videos a S3 más adelante (cuando tengas presupuesto)

### ¿Qué pasa si mi internet se cae?

El tunnel se desconecta. Al volver internet, se reconecta automáticamente.

### ¿Cuánto ancho de banda consume?

Depende del tráfico de videos. Ejemplo:
- Video de 100MB visto por 10 estudiantes = 1GB de subida
- Con internet de 10 Mbps de subida = 13 minutos para subir 1GB

### ¿Puedo tener múltiples tunnels?

**SÍ**, puedes crear uno para videos y otro para el backend si quieres:

```powershell
cloudflared tunnel create videos-elearning
cloudflared tunnel create api-elearning
```

Luego en `config.yml`:

```yaml
tunnel: <TUNNEL_ID_1>
credentials-file: C:\Users\TuUsuario\.cloudflared\<TUNNEL_ID_1>.json

ingress:
  - hostname: videos.tudominio.com
    service: http://localhost:8080
  - hostname: api.tudominio.com
    service: http://localhost:5000
  - service: http_status:404
```

### ¿Es seguro?

**SÍ**, porque:
- ✅ Todo el tráfico va cifrado (HTTPS)
- ✅ No abres puertos en tu router
- ✅ Tu IP real no se expone
- ✅ Cloudflare tiene protección DDoS
- ✅ Puedes agregar autenticación extra en Cloudflare Access (gratis hasta 50 usuarios)

---

## 🎓 Para tu presentación universitaria

**Argumentos para defender Cloudflare Tunnel:**

1. **Gratuito:** No gasto en S3 ni en servidores adicionales
2. **Permanente:** La URL nunca cambia (mejor que ngrok free)
3. **Profesional:** Dominio personalizado con HTTPS
4. **Escalable:** Si crece el proyecto, migramos a S3 sin cambiar código
5. **Moderno:** Tecnología actual usada por empresas (Zero Trust)
6. **Seguro:** No expone IP ni abre puertos
7. **Fácil:** Instalación en 10 minutos

---

## 📚 Recursos adicionales

- **Documentación oficial:** https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/
- **GitHub cloudflared:** https://github.com/cloudflare/cloudflared
- **Tutorial video:** https://www.youtube.com/results?search_query=cloudflare+tunnel+tutorial
- **Comunidad Discord:** https://discord.gg/cloudflaredev

---

## ✅ Checklist de implementación

- [ ] Instalar cloudflared (`choco install cloudflared`)
- [ ] Autenticar con Cloudflare (`cloudflared tunnel login`)
- [ ] Crear tunnel (`cloudflared tunnel create videos-elearning`)
- [ ] Crear archivo `config.yml`
- [ ] Configurar DNS (`cloudflared tunnel route dns...`)
- [ ] Probar tunnel (`cloudflared tunnel run videos-elearning`)
- [ ] Instalar como servicio Windows (`cloudflared service install`)
- [ ] Actualizar `.env` del frontend con nueva URL
- [ ] Actualizar `.env` del backend con nueva URL
- [ ] Probar subida de videos desde panel profesor
- [ ] Probar reproducción desde panel estudiante
- [ ] Verificar progreso de video se guarda correctamente

**¡Listo para producción!** 🚀
