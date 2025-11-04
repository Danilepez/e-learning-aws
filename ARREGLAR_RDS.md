# 🔧 Cómo Arreglar Conexión a RDS

## 🔴 Problema Actual

Tu RDS está en una **subnet privada** (172.31.18.67) y no es accesible desde Internet.

```
Tu PC → Internet → AWS ❌ → RDS (subnet privada)
                    Bloqueado por Security Group
```

---

## ✅ Solución: Habilitar acceso público

### Opción A: Configurar RDS desde AWS Console (RECOMENDADO)

1. **Ir a AWS Console:**
   - https://console.aws.amazon.com/rds/
   - Región: **us-east-2** (Ohio)

2. **Seleccionar tu base de datos:**
   - Click en `elearning-dani-db`

3. **Modificar configuración:**
   - Click en botón **"Modify"**
   - Scroll hasta **"Connectivity"**
   - En **"Public access"**: Cambiar a **"Yes"**
   - Scroll al final y click **"Continue"**
   - Seleccionar **"Apply immediately"**
   - Click **"Modify DB instance"**

4. **Esperar 5-10 minutos** hasta que el estado cambie de "Modifying" a "Available"

5. **Configurar Security Group:**
   - En la pestaña **"Connectivity & security"**
   - Click en el **Security Group** (ejemplo: `sg-xxxxx`)
   - Click en **"Edit inbound rules"**
   - Click **"Add rule"**:
     - Type: **PostgreSQL**
     - Protocol: **TCP**
     - Port: **5432**
     - Source: **My IP** (seleccionará tu IP automáticamente)
     - Description: `Desarrollo local`
   - Click **"Save rules"**

---

## ✅ Opción B: Usar PostgreSQL Local (Alternativa rápida)

Si no puedes modificar RDS o quieres probar rápido:

### 1. Instalar PostgreSQL local:

```powershell
choco install postgresql
```

### 2. Crear base de datos local:

```powershell
# Abrir psql
psql -U postgres

# En psql:
CREATE DATABASE elearning;
\q
```

### 3. Ejecutar el schema:

```powershell
cd backend
psql -U postgres -d elearning -f src/config/schema.sql
```

### 4. Actualizar backend/.env:

```properties
# Base de datos PostgreSQL (LOCAL)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=elearning
DB_USER=postgres
DB_PASSWORD=tu_password_de_postgres
```

---

## ✅ Opción C: SSH Tunnel a través de EC2 (Producción)

Si el RDS debe permanecer privado (buena práctica):

### 1. Tener una instancia EC2 en la misma VPC

### 2. Crear SSH tunnel:

```powershell
ssh -i "tu-key.pem" -L 5432:elearning-dani-db.c54qq8k0wsin.us-east-2.rds.amazonaws.com:5432 ec2-user@tu-ec2-ip
```

### 3. Conectar a localhost:5432

```properties
DB_HOST=localhost
DB_PORT=5432
```

El tunnel redirige localhost:5432 → EC2 → RDS

---

## 🎯 Recomendación para tu proyecto

Para **desarrollo/presentación universitaria**:
- ✅ **Usar PostgreSQL local** (Opción B)
- Más rápido y sin costos
- No depende de AWS

Para **producción real**:
- ✅ **RDS con acceso público temporal** (Opción A)
- Cambiar Security Group a tu IP específica
- Desactivar acceso público después

---

## 📋 Verificar conectividad después

Después de aplicar cualquier solución:

```powershell
cd backend

# Probar conexión
node -e "const { Pool } = require('pg'); const pool = new Pool({ host: 'localhost', port: 5432, database: 'elearning', user: 'postgres', password: 'tu_password' }); pool.query('SELECT NOW()', (err, res) => { console.log(err ? '❌ Error: ' + err.message : '✅ Conectado: ' + res.rows[0].now); pool.end(); });"
```

Si ves `✅ Conectado: 2025-11-03...` entonces funciona.

---

## 🚀 Después de arreglar la DB

Reinicia el backend:

```powershell
cd backend
npm run dev
```

Deberías ver:
```
🔍 Verificando conexión a PostgreSQL...
✅ Conexión a PostgreSQL exitosa
⚡ Servidor corriendo en http://localhost:5000
```

---

## ⚠️ Nota sobre Security Group

Si habilitas acceso público en RDS, SIEMPRE configura el Security Group para:
- ✅ Solo tu IP (no 0.0.0.0/0)
- ✅ Cambiar contraseña por una fuerte
- ✅ Desactivar después de desarrollo si no es necesario

**Nunca dejes 0.0.0.0/0** en producción (permite conexiones desde cualquier IP del mundo).
