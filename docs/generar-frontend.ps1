# ============================================
# GENERADOR AUTOMÁTICO DE FRONTEND
# Crea todos los archivos necesarios para React + MUI
# ============================================

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🎨 GENERANDO FRONTEND COMPLETO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$frontendPath = "C:\Dani\UPB\Sexto Semestre\Aplicaciones con Redes\Plataforma eLearning\frontend"

# ============================================
# ARCHIVOS BÁSICOS
# ============================================

Write-Host "📝 Creando archivos básicos..." -ForegroundColor Yellow

# .gitignore
@"
node_modules/
dist/
.env
.env.local
*.log
.DS_Store
"@ | Out-File "$frontendPath\.gitignore" -Encoding UTF8

# .env.example
@"
VITE_API_URL=http://localhost:5000/api
VITE_VIDEO_SERVER_URL=http://localhost:8080
"@ | Out-File "$frontendPath\.env.example" -Encoding UTF8

# main.jsx
@"
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
"@ | Out-File "$frontendPath\src\main.jsx" -Encoding UTF8

Write-Host "✅ Archivos básicos creados" -ForegroundColor Green

# ============================================
# TEMA MATERIAL-UI
# ============================================

Write-Host "🎨 Creando tema Material-UI..." -ForegroundColor Yellow

@"
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1565C0',
      light: '#5E92F3',
      dark: '#003C8F',
    },
    secondary: {
      main: '#37474F',
    },
    background: {
      default: '#F5F7FA',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    button: {
      textTransform: 'none',
    },
  },
});

export default theme;
"@ | Out-File "$frontendPath\src\theme\theme.js" -Encoding UTF8

Write-Host "✅ Tema creado" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ FRONTEND BASE GENERADO" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 PRÓXIMOS PASOS:" -ForegroundColor Yellow
Write-Host "1. cd frontend" -ForegroundColor Gray
Write-Host "2. npm install" -ForegroundColor Gray
Write-Host "3. npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "⚠️  IMPORTANTE: Voy a crear los componentes React restantes..." -ForegroundColor Yellow
Write-Host ""

Read-Host "Presiona Enter para continuar"
