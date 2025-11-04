import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Alert,
  CircularProgress,
  LinearProgress,
  Chip,
} from '@mui/material';
import { PlayArrow, CheckCircle } from '@mui/icons-material';
import axios from 'axios';
import config from '../../config';

const MyCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyCourses();
  }, []);

  const fetchMyCourses = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/courses/my-courses`);
      setCourses(response.data.courses || []);
      setError('');
    } catch (err) {
      setError('Error al cargar tus cursos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = (course) => {
    if (!course.total_modules || course.total_modules === 0) return 0;
    const completed = course.completed_modules || 0;
    return Math.round((completed / course.total_modules) * 100);
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Mis Cursos
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Continúa tu aprendizaje
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {courses.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No estás inscrito en ningún curso
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/student/disponibles')}
            sx={{ mt: 2 }}
          >
            Explorar Cursos
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {courses.map((course) => {
            const progress = calculateProgress(course);
            const isCompleted = course.completed;

            return (
              <Grid item xs={12} sm={6} md={4} key={course.id}>
                <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        {course.title}
                      </Typography>
                      {isCompleted && (
                        <CheckCircle color="success" />
                      )}
                    </Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2, minHeight: 60 }}
                    >
                      {course.description?.substring(0, 100)}
                      {course.description?.length > 100 && '...'}
                    </Typography>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Profesor: {course.teacher_name || 'N/A'}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          Progreso
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {Math.round(progress)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        label={`${course.completed_modules || 0}/${course.total_modules || 0} módulos`}
                        size="small"
                        color={isCompleted ? 'success' : 'default'}
                      />
                      {isCompleted && (
                        <Chip
                          label="Completado"
                          size="small"
                          color="success"
                        />
                      )}
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<PlayArrow />}
                      onClick={() => navigate(`/student/curso/${course.id}`)}
                    >
                      {progress > 0 ? 'Continuar' : 'Comenzar'}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
};

export default MyCourses;
