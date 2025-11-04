import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import config from './config/config.js';
import { testConnection } from './config/database.js';

// Importar rutas
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import moduleRoutes from './routes/moduleRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import enrollmentRoutes from './routes/enrollmentRoutes.js';

const app = express();

// ===== MIDDLEWARES DE SEGURIDAD =====

// Helmet para headers de seguridad
app.use(helmet());

// CORS
app.use(cors({
  origin: config.cors.origins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting (100 requests por 15 minutos)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Demasiadas peticiones desde esta IP, intenta de nuevo más tarde',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== RUTAS =====

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    message: 'Backend API funcionando',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/enrollments', enrollmentRoutes);

// Ruta no encontrada
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    path: req.originalUrl
  });
});

// Manejador global de errores
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor',
    ...(config.nodeEnv === 'development' && { stack: err.stack })
  });
});

// ===== INICIAR SERVIDOR =====

const startServer = async () => {
  try {
    // Verificar conexión a la base de datos
    console.log('🔍 Verificando conexión a PostgreSQL...');
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('❌ No se pudo conectar a la base de datos');
      console.log('💡 Tip: Verifica que PostgreSQL esté corriendo y las credenciales en .env sean correctas');
      process.exit(1);
    }

    // Iniciar servidor
    app.listen(config.port, () => {
      console.log('');
      console.log('========================================');
      console.log('🚀 SERVIDOR BACKEND INICIADO');
      console.log('========================================');
      console.log(`📍 URL: http://localhost:${config.port}`);
      console.log(`🌍 Ambiente: ${config.nodeEnv}`);
      console.log(`🗄️  Base de datos: ${config.database.host}:${config.database.port}/${config.database.database}`);
      console.log(`🎥 Video Server: ${config.videoServer.url}`);
      console.log('========================================');
      console.log('');
      console.log('📋 Endpoints disponibles:');
      console.log('   GET  /health');
      console.log('   POST /api/auth/register');
      console.log('   POST /api/auth/login');
      console.log('   GET  /api/auth/profile');
      console.log('   GET  /api/users');
      console.log('   GET  /api/courses');
      console.log('   POST /api/courses');
      console.log('   POST /api/progress');
      console.log('');
      console.log('✅ Servidor listo para recibir peticiones');
      console.log('');
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Manejar errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Iniciar
startServer();

export default app;
