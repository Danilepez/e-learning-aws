import { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  IconButton,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../../config';

const TeacherCourses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
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

  const handleDelete = async (courseId) => {
    if (!window.confirm('¿Estás seguro de eliminar este curso?')) return;

    try {
      await axios.delete(`${config.apiUrl}/courses/${courseId}`);
      setSuccess('Curso eliminado correctamente');
      fetchCourses();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al eliminar curso');
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Mis Cursos</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/teacher/crear')}
        >
          Crear Curso
        </Button>
      </Box>

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
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No tienes cursos creados
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/teacher/crear')}
            sx={{ mt: 2 }}
          >
            Crear tu Primer Curso
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {courses.map((course) => (
            <Grid item xs={12} sm={6} md={4} key={course.id}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {course.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2, minHeight: 60 }}
                  >
                    {course.description?.substring(0, 100)}
                    {course.description?.length > 100 && '...'}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                      label={`${course.enrolled_count || 0} estudiantes`}
                      size="small"
                      color="primary"
                    />
                    {course.duration && (
                      <Chip
                        label={formatDuration(course.duration)}
                        size="small"
                      />
                    )}
                  </Box>
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between' }}>
                  <Button
                    size="small"
                    onClick={() => navigate(`/teacher/cursos/${course.id}/modulos`)}
                  >
                    Módulos
                  </Button>
                  <Box>
                    <IconButton size="small" color="primary">
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(course.id)}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default TeacherCourses;
