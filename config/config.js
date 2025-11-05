require('dotenv').config();

const config = {
  // Servidor
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT) || 3000,
  apiUrl: process.env.API_URL || 'http://localhost:3000',

  // Base de datos
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'lonquiexpress_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  },

  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'default_secret_change_in_production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'default_refresh_secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
  },

  // Email
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    },
    from: process.env.EMAIL_FROM || 'LonquiExpress <noreply@lonquiexpress.cl>'
  },

  // Uploads
  uploads: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
    allowedTypes: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/svg+xml').split(','),
    destination: './uploads'
  },

  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:8080',
    credentials: true
  },

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
  },

  // Logs
  logs: {
    level: process.env.LOG_LEVEL || 'info',
    filePath: process.env.LOG_FILE_PATH || './logs'
  },

  // Sistema
  system: {
    timezone: process.env.TIMEZONE || 'America/Santiago',
    language: process.env.DEFAULT_LANGUAGE || 'es'
  }
};

module.exports = config;
