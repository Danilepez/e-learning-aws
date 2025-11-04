import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import config from '../config';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Configurar axios con token
  useEffect(() => {
    const token = localStorage.getItem(config.tokenKey);
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  const loadUser = async () => {
    try {
      const response = await axios.get(`${config.apiUrl}/auth/profile`);
      setUser(response.data.user);
    } catch (error) {
      console.error('Error al cargar usuario:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${config.apiUrl}/auth/login`, {
        email,
        password
      });

      const { token, user } = response.data;
      
      localStorage.setItem(config.tokenKey, token);
      localStorage.setItem(config.userKey, JSON.stringify(user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Error al iniciar sesión'
      };
    }
  };

  const register = async (userData) => {
    try {
      await axios.post(`${config.apiUrl}/auth/register`, userData);
      return { success: true, message: 'Usuario registrado exitosamente' };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.error || 'Error al registrar usuario'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem(config.tokenKey);
    localStorage.removeItem(config.userKey);
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
