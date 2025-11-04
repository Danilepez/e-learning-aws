// Configuración de la aplicación

const config = {
  // URL del backend API
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  
  // URL del servidor de videos (Cloudflare Tunnel)
  videoServerUrl: import.meta.env.VITE_VIDEO_SERVER_URL || 'http://localhost:8080',
  
  // Configuración de la aplicación
  appName: 'eLearning Platform',
  appVersion: '1.0.0',
  
  // Configuración de autenticación
  tokenKey: 'elearning_token',
  userKey: 'elearning_user',
};

export default config;
