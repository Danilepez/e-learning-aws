import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import theme from './theme/theme';

// Auth Components
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import TeacherLayout from './layouts/TeacherLayout';
import StudentLayout from './layouts/StudentLayout';

// Admin Components
import AdminDashboard from './components/Admin/AdminDashboard';
import UserManagement from './components/Admin/UserManagement';
import AdminCourses from './components/Admin/AdminCourses';
import Enrollments from './components/Admin/Enrollments';

// Teacher Components
import TeacherCourses from './components/Teacher/TeacherCourses';
import CreateCourse from './components/Teacher/CreateCourse';
import CourseModules from './components/Teacher/CourseModules';
import VideoManagement from './components/Teacher/VideoManagement';

// Student Components
import AvailableCourses from './components/Student/AvailableCourses';
import MyCourses from './components/Student/MyCourses';
import CourseViewer from './components/Student/CourseViewer';

// Home redirect component
const HomeRedirect = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (user.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  } else if (user.role === 'teacher') {
    return <Navigate to="/teacher/cursos" replace />;
  } else if (user.role === 'student') {
    return <Navigate to="/student/disponibles" replace />;
  }
  
  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Home Route */}
            <Route path="/" element={<HomeRedirect />} />
            
            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="usuarios" element={<UserManagement />} />
              <Route path="cursos" element={<AdminCourses />} />
              <Route path="inscripciones" element={<Enrollments />} />
            </Route>
            
            {/* Teacher Routes */}
            <Route
              path="/teacher"
              element={
                <ProtectedRoute allowedRoles={['teacher']}>
                  <TeacherLayout />
                </ProtectedRoute>
              }
            >
              <Route path="cursos" element={<TeacherCourses />} />
              <Route path="crear" element={<CreateCourse />} />
              <Route path="cursos/:id/modulos" element={<CourseModules />} />
              <Route path="videos" element={<VideoManagement />} />
            </Route>
            
            {/* Student Routes */}
            <Route
              path="/student"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentLayout />
                </ProtectedRoute>
              }
            >
              <Route path="disponibles" element={<AvailableCourses />} />
              <Route path="cursos" element={<MyCourses />} />
              <Route path="curso/:id" element={<CourseViewer />} />
            </Route>
            
            {/* 404 Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
