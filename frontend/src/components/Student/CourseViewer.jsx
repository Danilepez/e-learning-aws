import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  Alert,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ArrowBack,
  PlayCircle,
  CheckCircle,
  RadioButtonUnchecked,
  EmojiEvents,
} from '@mui/icons-material';
import axios from 'axios';
import config from '../../config';

const CourseViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [currentModule, setCurrentModule] = useState(null);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCongrats, setShowCongrats] = useState(false);
  
  const lastUpdateRef = useRef(0);

  useEffect(() => {
    fetchCourseData();
  }, [id]);

  useEffect(() => {
    if (modules.length > 0 && !currentModule) {
      // Cargar el primer módulo no completado o el primero
      const unfinished = modules.find(m => !progress[m.id]?.completed);
      setCurrentModule(unfinished || modules[0]);
    }
  }, [modules, progress]);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      
      // Obtener curso
      const courseRes = await axios.get(`${config.apiUrl}/courses/${id}`);
      setCourse(courseRes.data.course);

      // Obtener módulos
      const modulesRes = await axios.get(`${config.apiUrl}/modules/course/${id}`);
      setModules(modulesRes.data.modules || []);

      // Obtener progreso de cada módulo
      const progressData = {};
      for (const module of modulesRes.data.modules || []) {
        try {
          const progRes = await axios.get(`${config.apiUrl}/progress/module/${module.id}`);
          if (progRes.data.progress) {
            progressData[module.id] = progRes.data.progress;
          }
        } catch (err) {
          // No hay progreso aún para este módulo
        }
      }
      setProgress(progressData);

      setLoading(false);
    } catch (err) {
      setError('Error al cargar el curso');
      console.error(err);
      setLoading(false);
    }
  };

  const handleTimeUpdate = async () => {
    if (!videoRef.current || !currentModule) return;

    const currentTime = Math.floor(videoRef.current.currentTime);
    const duration = Math.floor(videoRef.current.duration);

    // Actualizar progreso cada 5 segundos
    if (currentTime - lastUpdateRef.current >= 5) {
      lastUpdateRef.current = currentTime;
      
      try {
        await axios.post(`${config.apiUrl}/progress`, {
          moduleId: currentModule.id,
          watchedSeconds: currentTime,
          lastPosition: currentTime,
          completed: false
        });
      } catch (err) {
        console.error('Error al actualizar progreso:', err);
      }
    }

    // Marcar como completado si vio al menos 90%
    if (duration > 0 && currentTime / duration >= 0.9 && !progress[currentModule.id]?.completed) {
      await markModuleCompleted();
    }
  };

  const markModuleCompleted = async () => {
    try {
      await axios.post(`${config.apiUrl}/progress/module/${currentModule.id}/complete`);
      
      // Actualizar progreso local
      setProgress(prev => ({
        ...prev,
        [currentModule.id]: { ...prev[currentModule.id], completed: true }
      }));

      // Verificar si completó todos los módulos
      const allCompleted = modules.every(m => 
        m.id === currentModule.id || progress[m.id]?.completed
      );

      if (allCompleted) {
        setShowCongrats(true);
      }
    } catch (err) {
      console.error('Error al marcar módulo:', err);
    }
  };

  const handleModuleClick = (module) => {
    setCurrentModule(module);
    if (videoRef.current) {
      videoRef.current.currentTime = progress[module.id]?.last_position || 0;
    }
  };

  const calculateCourseProgress = () => {
    if (modules.length === 0) return 0;
    const completed = Object.values(progress).filter(p => p.completed).length;
    return (completed / modules.length) * 100;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error">{error}</Alert>
        <Button onClick={() => navigate('/student/cursos')} sx={{ mt: 2 }}>
          Volver a Mis Cursos
        </Button>
      </Box>
    );
  }

  const courseProgress = calculateCourseProgress();

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/student/cursos')}
        >
          Volver a Mis Cursos
        </Button>
      </Box>

      {/* Header del curso */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          {course?.title}
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          {course?.description}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Chip label={`Profesor: ${course?.teacher_name || 'N/A'}`} />
          <Chip label={`${modules.length} módulos`} color="primary" />
        </Box>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Progreso del curso: {courseProgress.toFixed(0)}%
          </Typography>
          <LinearProgress variant="determinate" value={courseProgress} sx={{ height: 8, borderRadius: 4 }} />
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Lista de módulos */}
        <Paper elevation={2} sx={{ width: { xs: '100%', md: '350px' }, flexShrink: 0 }}>
          <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
            <Typography variant="h6">Módulos del Curso</Typography>
          </Box>
          <List>
            {modules.map((module, index) => (
              <ListItem key={module.id} disablePadding>
                <ListItemButton
                  selected={currentModule?.id === module.id}
                  onClick={() => handleModuleClick(module)}
                >
                  <ListItemIcon>
                    {progress[module.id]?.completed ? (
                      <CheckCircle color="success" />
                    ) : currentModule?.id === module.id ? (
                      <PlayCircle color="primary" />
                    ) : (
                      <RadioButtonUnchecked />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={`${index + 1}. ${module.title}`}
                    secondary={module.description}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Paper>

        {/* Reproductor de video */}
        <Box sx={{ flexGrow: 1 }}>
          {currentModule ? (
            <Paper elevation={2}>
              <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
                <Typography variant="h6">{currentModule.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {currentModule.description}
                </Typography>
              </Box>
              <Box sx={{ position: 'relative', paddingTop: '56.25%', bgcolor: '#000' }}>
                <video
                  ref={videoRef}
                  controls
                  onTimeUpdate={handleTimeUpdate}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                  }}
                  src={`${config.videoServerUrl}/api/videos/stream/${currentModule.video_filename}`}
                >
                  Tu navegador no soporta el elemento de video.
                </video>
              </Box>
            </Paper>
          ) : (
            <Alert severity="info">
              Selecciona un módulo para comenzar a ver el curso
            </Alert>
          )}
        </Box>
      </Box>

      {/* Dialog de felicitaciones */}
      <Dialog open={showCongrats} onClose={() => setShowCongrats(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', pt: 4 }}>
          <EmojiEvents sx={{ fontSize: 80, color: '#FFD700' }} />
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>
            ¡Felicitaciones!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Has completado exitosamente el curso <strong>{course?.title}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Has demostrado dedicación y esfuerzo en tu aprendizaje. ¡Sigue así!
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 4 }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/student/cursos')}
          >
            Volver a Mis Cursos
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CourseViewer;
