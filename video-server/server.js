import express from 'express';
import multer from 'multer';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Configuración de CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5000'],
  credentials: true
}));

app.use(express.json());

// Carpeta de videos - usar la carpeta del usuario si existe, sino crear local
const USER_VIDEOS_DIR = 'C:\\Users\\danil\\Videos\\Captures';
const LOCAL_VIDEOS_DIR = path.join(__dirname, 'videos');

let VIDEOS_DIR;
if (fs.existsSync(USER_VIDEOS_DIR)) {
  VIDEOS_DIR = USER_VIDEOS_DIR;
  console.log('📁 Usando carpeta de videos existente:', VIDEOS_DIR);
} else {
  VIDEOS_DIR = LOCAL_VIDEOS_DIR;
  if (!fs.existsSync(VIDEOS_DIR)) {
    fs.mkdirSync(VIDEOS_DIR, { recursive: true });
  }
  console.log('📁 Usando carpeta local de videos:', VIDEOS_DIR);
}

// Configuración de Multer para almacenar videos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, VIDEOS_DIR);
  },
  filename: (req, file, cb) => {
    // Generar nombre único: timestamp-nombre-original
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9-_]/g, '_');
    cb(null, `${uniqueSuffix}-${sanitizedName}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500 MB
  },
  fileFilter: (req, file, cb) => {
    // Aceptar solo videos
    const allowedMimes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de video (mp4, webm, ogg, mov)'));
    }
  }
});

// Ruta de health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'video-server',
    videosPath: VIDEOS_DIR,
    port: PORT
  });
});

// Obtener lista de videos
app.get('/api/videos', (req, res) => {
  try {
    const files = fs.readdirSync(VIDEOS_DIR);
    const videos = files
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.mp4', '.webm', '.ogg', '.mov'].includes(ext);
      })
      .map(file => {
        const filePath = path.join(VIDEOS_DIR, file);
        const stats = fs.statSync(filePath);
        return {
          filename: file,
          size: stats.size,
          uploadDate: stats.birthtime,
          url: `http://localhost:${PORT}/api/videos/stream/${file}`
        };
      });

    res.json({ videos });
  } catch (error) {
    console.error('Error al listar videos:', error);
    res.status(500).json({ error: 'Error al listar videos' });
  }
});

// Subir video
app.post('/api/videos/upload', upload.single('video'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se recibió ningún archivo' });
    }

    console.log('✅ Video subido:', req.file.filename);
    
    res.json({
      message: 'Video subido exitosamente',
      video: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        url: `http://localhost:${PORT}/api/videos/stream/${req.file.filename}`
      }
    });
  } catch (error) {
    console.error('Error al subir video:', error);
    res.status(500).json({ error: 'Error al subir video' });
  }
});

// Streaming de video
app.get('/api/videos/stream/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(VIDEOS_DIR, filename);

    // Verificar que el archivo existe
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Video no encontrado' });
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      // Streaming parcial (para seek en el video)
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(filePath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      // Streaming completo
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      };
      res.writeHead(200, head);
      fs.createReadStream(filePath).pipe(res);
    }
  } catch (error) {
    console.error('Error al transmitir video:', error);
    res.status(500).json({ error: 'Error al transmitir video' });
  }
});

// Eliminar video
app.delete('/api/videos/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(VIDEOS_DIR, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Video no encontrado' });
    }

    fs.unlinkSync(filePath);
    console.log('🗑️ Video eliminado:', filename);
    
    res.json({ message: 'Video eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar video:', error);
    res.status(500).json({ error: 'Error al eliminar video' });
  }
});

// Información de un video específico
app.get('/api/videos/info/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(VIDEOS_DIR, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Video no encontrado' });
    }

    const stats = fs.statSync(filePath);
    
    res.json({
      filename: filename,
      size: stats.size,
      uploadDate: stats.birthtime,
      modifiedDate: stats.mtime,
      url: `http://localhost:${PORT}/api/videos/stream/${filename}`
    });
  } catch (error) {
    console.error('Error al obtener info del video:', error);
    res.status(500).json({ error: 'Error al obtener información del video' });
  }
});

// Manejo de errores de Multer
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'El archivo es demasiado grande. Máximo 500MB' });
    }
    return res.status(400).json({ error: error.message });
  }
  
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  
  next();
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('\n========================================');
  console.log('🎥 SERVIDOR DE VIDEOS INICIADO');
  console.log('========================================');
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`📁 Carpeta de videos: ${VIDEOS_DIR}`);
  console.log('========================================\n');
  console.log('📋 Endpoints disponibles:');
  console.log('   GET    /health');
  console.log('   GET    /api/videos');
  console.log('   POST   /api/videos/upload');
  console.log('   GET    /api/videos/stream/:filename');
  console.log('   DELETE /api/videos/:filename');
  console.log('   GET    /api/videos/info/:filename');
  console.log('\n✅ Servidor listo para recibir videos\n');
});

export default app;
