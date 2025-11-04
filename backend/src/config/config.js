import dotenv from 'dotenv';
dotenv.config();

const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'elearning',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-key',
    expiresIn: '7d',
  },
  
  videoServer: {
    url: process.env.VIDEO_SERVER_URL || 'http://localhost:8080',
  },
  
  cors: {
    origins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
  },
};

export default config;
