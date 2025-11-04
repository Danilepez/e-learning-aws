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
  Chip,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import axios from 'axios';
import config from '../../config';

const Enrollments = () => {
  const [students, setStudents] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Obtener usuarios (filtrar estudiantes)
      const usersRes = await axios.get(`${config.apiUrl}/users`);
      const allUsers = usersRes.data.users || [];
      const studentList = allUsers.filter(user => user.role === 'student');
      
      // Obtener todos los cursos
      const coursesRes = await axios.get(`${config.apiUrl}/courses`);
      const allCourses = coursesRes.data.courses || [];
      
      // Obtener inscripciones
      const enrollRes = await axios.get(`${config.apiUrl}/enrollments`);
      const allEnrollments = enrollRes.data.enrollments || [];
      
      setStudents(studentList);
      setCourses(allCourses);
      setEnrollments(allEnrollments);
      setError('');
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar inscripciones');
    } finally {
      setLoading(false);
    }
  };

  const getStudentEnrollments = (studentId) => {
    return enrollments.filter(e => e.student_id === studentId);
  };

  const getCourseName = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    return course ? course.title : 'Curso desconocido';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Inscripciones de Estudiantes
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper elevation={2} sx={{ mt: 3 }}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Total de Estudiantes: {students.length}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Total de Inscripciones: {enrollments.length}
          </Typography>
        </Box>

        {students.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No hay estudiantes registrados
            </Typography>
          </Box>
        ) : (
          <Box sx={{ p: 2 }}>
            {students.map((student) => {
              const studentEnrolls = getStudentEnrollments(student.id);
              return (
                <Accordion key={student.id}>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                      <Typography sx={{ fontWeight: 'bold' }}>
                        {student.name}
                      </Typography>
                      <Typography color="text.secondary" sx={{ fontSize: '0.9rem' }}>
                        ({student.email})
                      </Typography>
                      <Chip 
                        label={`${studentEnrolls.length} curso${studentEnrolls.length !== 1 ? 's' : ''}`}
                        size="small"
                        color="primary"
                        sx={{ ml: 'auto' }}
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    {studentEnrolls.length === 0 ? (
                      <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        No está inscrito en ningún curso
                      </Typography>
                    ) : (
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell><strong>Curso</strong></TableCell>
                              <TableCell><strong>Fecha de Inscripción</strong></TableCell>
                              <TableCell><strong>Progreso</strong></TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {studentEnrolls.map((enrollment) => (
                              <TableRow key={enrollment.id}>
                                <TableCell>{getCourseName(enrollment.course_id)}</TableCell>
                                <TableCell>
                                  {new Date(enrollment.enrolled_at).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                  <Chip 
                                    label={enrollment.completed ? 'Completado' : 'En progreso'}
                                    size="small"
                                    color={enrollment.completed ? 'success' : 'default'}
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default Enrollments;
