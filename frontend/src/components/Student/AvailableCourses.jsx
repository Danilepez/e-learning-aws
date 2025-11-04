import { useState, useEffect } from 'react';
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
  Chip,
} from '@mui/material';
import { PlayArrow, Check } from '@mui/icons-material';
import axios from 'axios';
import config from '../../config';

const AvailableCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/courses`);
      setCourses(response.data.courses || []);
      setError('');
    } catch (err) {
      setError('Error al cargar cursos disponibles');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      await axios.post(`${config.apiUrl}/courses/${courseId}/enroll`);
      setSuccess('Te has inscrito exitosamente al curso');
      fetchCourses(); // Recargar para actualizar estado
    } catch (err) {
      if (err.response?.status === 400) {
        setError('Ya estás inscrito en este curso');
      } else {
        setError(err.response?.data?.message || 'Error al inscribirse');
      }
    }
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
        Cursos Disponibles
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Explora y matricúlate en los cursos disponibles
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {courses.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No hay cursos disponibles en este momento
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {courses.map((course) => (
            <Grid item xs={12} sm={6} md={4} key={course.id}>
              <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {course.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2, minHeight: 60 }}
                  >
                    {course.description?.substring(0, 120)}
                    {course.description?.length > 120 && '...'}
                  </Typography>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Profesor: {course.teacher_name || 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {course.duration && (
                      <Chip
                        label={formatDuration(course.duration)}
                        size="small"
                      />
                    )}
                    {course.is_enrolled && (
                      <Chip
                        icon={<Check />}
                        label="Inscrito"
                        size="small"
                        color="success"
                      />
                    )}
                  </Box>
                </CardContent>
                <CardActions>
                  {course.is_enrolled ? (
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<PlayArrow />}
                      disabled
                    >
                      Ver Curso (próximamente)
                    </Button>
                  ) : (
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => handleEnroll(course.id)}
                    >
                      Inscribirse
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default AvailableCourses;
