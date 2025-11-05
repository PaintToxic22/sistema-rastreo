const logger = require('../utils/logger');

/**
 * Middleware de manejo de errores global
 */
const errorHandler = (err, req, res, next) => {
  // Log del error
  logger.error('❌ Error capturado:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    user: req.user?.email || 'No autenticado'
  });

  // Determinar código de estado
  const statusCode = err.statusCode || err.status || 500;

  // Respuesta al cliente
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      error: err
    })
  });
};

/**
 * Middleware para rutas no encontradas
 */
const notFound = (req, res, next) => {
  const error = new Error(`Ruta no encontrada - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

/**
 * Wrapper para funciones async
 * Captura errores automáticamente
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  notFound,
  asyncHandler
};
