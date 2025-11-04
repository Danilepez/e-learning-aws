import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert,
  LinearProgress,
  Chip,
} from '@mui/material';
import { Delete, CloudUpload, VideoLibrary } from '@mui/icons-material';
import axios from 'axios';
import config from '../../config';

const VideoManagement = () => {
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await axios.get(`${config.videoServerUrl}/api/videos`);
      setVideos(response.data.videos || []);
      setError('');
    } catch (err) {
      setError('Error al cargar videos');
      console.error(err);
    }
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('video/')) {
      setError('Por favor selecciona un archivo de video válido');
      return;
    }

    // Validar tamaño (500MB)
    if (file.size > 500 * 1024 * 1024) {
      setError('El archivo no puede superar los 500MB');
      return;
    }

    const formData = new FormData();
    formData.append('video', file);

    setUploading(true);
    setError('');
    setUploadProgress(0);

    try {
      await axios.post(`${config.videoServerUrl}/api/videos/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });

      setSuccess('Video subido exitosamente');
      fetchVideos();
      event.target.value = '';
    } catch (err) {
      setError(err.response?.data?.message || 'Error al subir el video');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (filename) => {
    if (!window.confirm(`¿Estás seguro de eliminar el video "${filename}"?`)) {
      return;
    }

    try {
      await axios.delete(`${config.videoServerUrl}/api/videos/${filename}`);
      setSuccess('Video eliminado correctamente');
      fetchVideos();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al eliminar el video');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Gestión de Videos
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

      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <input
            accept="video/*"
            style={{ display: 'none' }}
            id="video-upload"
            type="file"
            onChange={handleFileSelect}
            disabled={uploading}
          />
          <label htmlFor="video-upload">
            <Button
              variant="contained"
              component="span"
              startIcon={<CloudUpload />}
              disabled={uploading}
            >
              {uploading ? 'Subiendo...' : 'Seleccionar Video'}
            </Button>
          </label>
          <Typography variant="body2" color="text.secondary">
            Máximo 500MB • Formatos: MP4, WebM, OGG
          </Typography>
        </Box>

        {uploading && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress variant="determinate" value={uploadProgress} />
            <Typography variant="caption" sx={{ mt: 1 }}>
              {uploadProgress}% completado
            </Typography>
          </Box>
        )}
      </Paper>

      <Paper elevation={2}>
        <Box sx={{ p: 2, bgcolor: '#f5f5f5' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <VideoLibrary color="primary" />
            <Typography variant="h6">
              Videos Disponibles ({videos.length})
            </Typography>
          </Box>
        </Box>

        {videos.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No hay videos subidos. Sube tu primer video para crear cursos.
            </Typography>
          </Box>
        ) : (
          <List>
            {videos.map((video, index) => (
              <ListItem
                key={index}
                divider={index < videos.length - 1}
                sx={{ py: 2 }}
              >
                <ListItemText
                  primary={video.filename}
                  secondary={
                    <Box component="span" sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                      <Chip
                        label={`${(video.size / (1024 * 1024)).toFixed(2)} MB`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <Chip
                        label={new Date(video.uploadDate).toLocaleDateString()}
                        size="small"
                        color="default"
                        variant="outlined"
                      />
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    color="error"
                    onClick={() => handleDelete(video.filename)}
                  >
                    <Delete />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
};

export default VideoManagement;
