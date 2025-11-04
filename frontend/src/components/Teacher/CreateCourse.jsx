import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import axios from 'axios';
import config from '../../config';

const CreateCourse = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const courseData = {
        title: formData.title,
        description: formData.description,
      };

      const response = await axios.post(`${config.apiUrl}/courses`, courseData);
      setSuccess('Curso creado exitosamente. Ahora agrega módulos.');
      setTimeout(() => navigate(`/teacher/cursos/${response.data.course.id}/modulos`), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear el curso');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/teacher/cursos')}
        >
          Volver a Mis Cursos
        </Button>
      </Box>

      <Paper elevation={2} sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
        <Typography variant="h4" gutterBottom>
          Crear Nuevo Curso
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Título del Curso"
            name="title"
            value={formData.title}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Descripción"
            name="description"
            value={formData.description}
            onChange={handleChange}
            margin="normal"
            multiline
            rows={4}
            required
          />
          <Alert severity="info" sx={{ mt: 2 }}>
            Después de crear el curso, podrás agregar módulos con sus respectivos videos.
          </Alert>
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              fullWidth
            >
              {loading ? 'Creando...' : 'Crear Curso'}
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/teacher/cursos')}
            >
              Cancelar
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default CreateCourse;
