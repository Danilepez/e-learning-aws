import { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from '@mui/material';
import { People, School, PersonAdd, TrendingUp } from '@mui/icons-material';
import axios from 'axios';
import config from '../../config';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [usersRes, coursesRes] = await Promise.all([
        axios.get(`${config.apiUrl}/users/stats`),
        axios.get(`${config.apiUrl}/courses`),
      ]);

      setStats({
        users: usersRes.data,
        totalCourses: coursesRes.data.length,
      });
    } catch (err) {
      setError('Error al cargar estadísticas');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  const statCards = [
    {
      title: 'Total Usuarios',
      value: stats?.users?.total || 0,
      icon: <People sx={{ fontSize: 40 }} />,
      color: '#1565C0',
    },
    {
      title: 'Estudiantes',
      value: stats?.users?.students || 0,
      icon: <PersonAdd sx={{ fontSize: 40 }} />,
      color: '#2E7D32',
    },
    {
      title: 'Profesores',
      value: stats?.users?.teachers || 0,
      icon: <School sx={{ fontSize: 40 }} />,
      color: '#ED6C02',
    },
    {
      title: 'Total Cursos',
      value: stats?.totalCourses || 0,
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
      color: '#9C27B0',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard Administrativo
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Estadísticas generales de la plataforma
      </Typography>

      <Grid container spacing={3}>
        {statCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card elevation={2}>
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" component="div">
                      {stat.value}
                    </Typography>
                  </Box>
                  <Box sx={{ color: stat.color }}>{stat.icon}</Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Distribución por Rol
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Administradores</Typography>
                <Typography fontWeight="bold">{stats?.users?.admins || 0}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Profesores</Typography>
                <Typography fontWeight="bold">{stats?.users?.teachers || 0}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>Estudiantes</Typography>
                <Typography fontWeight="bold">{stats?.users?.students || 0}</Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Resumen de Actividad
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Cursos Activos</Typography>
                <Typography fontWeight="bold">{stats?.totalCourses || 0}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Total Usuarios</Typography>
                <Typography fontWeight="bold">{stats?.users?.total || 0}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography>Plataforma</Typography>
                <Typography fontWeight="bold" color="success.main">
                  Operativa
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
