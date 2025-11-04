import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Alert,
  Chip,
  CircularProgress,
} from '@mui/material';
import { Delete, Visibility } from '@mui/icons-material';
import axios from 'axios';
import config from '../../config';

const AdminCourses = () => {
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
      setError('Error al cargar cursos');
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
      <Typography variant="h4" gutterBottom>
        Gestión de Cursos
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

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Título</TableCell>
              <TableCell>Profesor</TableCell>
              <TableCell>Duración</TableCell>
              <TableCell>Inscritos</TableCell>
              <TableCell>Fecha Creación</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {courses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No hay cursos registrados
                </TableCell>
              </TableRow>
            ) : (
              courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell>{course.id}</TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="bold">
                      {course.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {course.description?.substring(0, 60)}...
                    </Typography>
                  </TableCell>
                  <TableCell>{course.teacher_name || 'N/A'}</TableCell>
                  <TableCell>
                    {course.duration ? formatDuration(course.duration) : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={course.enrolled_count || 0}
                      color="primary"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(course.created_at).toLocaleDateString('es-ES')}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" color="primary">
                      <Visibility />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(course.id)}
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AdminCourses;
