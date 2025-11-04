import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert,
  MenuItem,
  Chip,
} from '@mui/material';
import {
  ArrowBack,
  Add,
  Edit,
  Delete,
  DragIndicator,
  VideoLibrary,
} from '@mui/icons-material';
import axios from 'axios';
import config from '../../config';

const CourseModules = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [videos, setVideos] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoFilename: '',
    orderIndex: 0,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCourse();
    fetchModules();
    fetchVideos();
  }, [id]);

  const fetchCourse = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/courses/${id}`);
      setCourse(response.data.course);
    } catch (err) {
      console.error('Error al cargar curso:', err);
    }
  };

  const fetchModules = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/modules/course/${id}`);
      setModules(response.data.modules || []);
    } catch (err) {
      console.error('Error al cargar módulos:', err);
    }
  };

  const fetchVideos = async () => {
    try {
      const response = await axios.get(`${config.videoServerUrl}/api/videos`);
      setVideos(response.data.videos || []);
    } catch (err) {
      console.error('Error al cargar videos:', err);
    }
  };

  const handleOpenDialog = (module = null) => {
    if (module) {
      setEditingModule(module);
      setFormData({
        title: module.title,
        description: module.description || '',
        videoFilename: module.video_filename,
        orderIndex: module.order_index,
      });
    } else {
      setEditingModule(null);
      setFormData({
        title: '',
        description: '',
        videoFilename: '',
        orderIndex: modules.length,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingModule(null);
    setFormData({
      title: '',
      description: '',
      videoFilename: '',
      orderIndex: 0,
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    try {
      setError('');
      const moduleData = {
        courseId: parseInt(id),
        title: formData.title,
        description: formData.description,
        videoFilename: formData.videoFilename,
        orderIndex: formData.orderIndex,
      };

      if (editingModule) {
        await axios.put(`${config.apiUrl}/modules/${editingModule.id}`, moduleData);
        setSuccess('Módulo actualizado exitosamente');
      } else {
        await axios.post(`${config.apiUrl}/modules`, moduleData);
        setSuccess('Módulo creado exitosamente');
      }

      fetchModules();
      handleCloseDialog();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar módulo');
    }
  };

  const handleDelete = async (moduleId) => {
    if (!window.confirm('¿Estás seguro de eliminar este módulo?')) {
      return;
    }

    try {
      await axios.delete(`${config.apiUrl}/modules/${moduleId}`);
      setSuccess('Módulo eliminado exitosamente');
      fetchModules();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al eliminar módulo');
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/teacher/cursos')}
        >
          Volver a Mis Cursos
        </Button>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
          disabled={videos.length === 0}
        >
          Agregar Módulo
        </Button>
      </Box>

      {videos.length === 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          No tienes videos disponibles. Ve a Gestionar Videos para subir videos antes de crear módulos.
        </Alert>
      )}

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          {course?.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {course?.description}
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Chip
            icon={<VideoLibrary />}
            label={`${modules.length} módulo(s)`}
            color="primary"
            variant="outlined"
          />
        </Box>
      </Paper>

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

      <Paper elevation={2}>
        <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
          <Typography variant="h6">Módulos del Curso</Typography>
        </Box>

        {modules.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No hay módulos en este curso. Agrega tu primer módulo para empezar.
            </Typography>
          </Box>
        ) : (
          <List>
            {modules.map((module, index) => (
              <ListItem
                key={module.id}
                divider={index < modules.length - 1}
                sx={{ py: 2 }}
              >
                <DragIndicator sx={{ mr: 2, color: 'text.secondary' }} />
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        Módulo {module.order_index + 1}: {module.title}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 0.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        {module.description || 'Sin descripción'}
                      </Typography>
                      <Chip
                        label={module.video_filename}
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => handleOpenDialog(module)}
                    sx={{ mr: 1 }}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    edge="end"
                    color="error"
                    onClick={() => handleDelete(module.id)}
                  >
                    <Delete />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      {/* Dialog para crear/editar módulo */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingModule ? 'Editar Módulo' : 'Nuevo Módulo'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Título del Módulo"
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
              rows={3}
            />
            <TextField
              fullWidth
              select
              label="Video"
              name="videoFilename"
              value={formData.videoFilename}
              onChange={handleChange}
              margin="normal"
              required
            >
              {videos.map((video) => (
                <MenuItem key={video.filename} value={video.filename}>
                  {video.filename} ({(video.size / (1024 * 1024)).toFixed(2)} MB)
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              type="number"
              label="Orden"
              name="orderIndex"
              value={formData.orderIndex}
              onChange={handleChange}
              margin="normal"
              helperText="Posición del módulo en el curso (0 = primero)"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancelar</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.title || !formData.videoFilename}
          >
            {editingModule ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CourseModules;
