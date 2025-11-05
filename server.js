const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/database');

// Importar rutas
const usuariosRoutes = require('./routes/usuarios');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARES
// ============================================

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:8000',
  credentials: true
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================
// CONECTAR A MONGODB
// ============================================

connectDB();

// ============================================
// RUTAS
// ============================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: '✅ OK',
    timestamp: new Date().toISOString(),
    database: 'MongoDB',
    port: PORT
  });
});

// Rutas de API
app.use('/api/usuarios', usuariosRoutes);

// Ruta por defecto
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Servidor LonquiExpress en MongoDB',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      usuarios: '/api/usuarios'
    }
  });
});

// ============================================
// MANEJO DE ERRORES
// ============================================

// 404 - No encontrado
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Ruta no encontrada'
  });
});

// Error general
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Error interno del servidor'
  });
});

// ============================================
// INICIAR SERVIDOR
// ============================================

app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════╗');
  console.log('║   🚀 SERVIDOR LONQUIEXPRESS         ║');
  console.log('║   Base de Datos: MongoDB            ║');
  console.log(`║   Puerto: ${PORT}                       ║`);
  console.log(`║   URL: http://localhost:${PORT}     ║`);
  console.log('║                                      ║');
  console.log('║   Health Check:                      ║');
  console.log(`║   http://localhost:${PORT}/api/health║`);
  console.log('╚══════════════════════════════════════╝');
  console.log('');
});