const { verifyToken } = require('../utils/jwt');
const logger = require('../utils/logger');

/**
 * Middleware de autenticación
 * Verifica que el token JWT sea válido
 */
const authenticate = (req, res, next) => {
  try {
    // Obtener token del header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token de autenticación no proporcionado'
      });
    }

    const token = authHeader.substring(7); // Remover 'Bearer '

    // Verificar token
    const decoded = verifyToken(token);
    
    // Agregar datos del usuario al request
    req.user = {
      id: decoded.id,
      email: decoded.email,
      rol: decoded.rol
    };

    logger.info('✅ Usuario autenticado:', { userId: req.user.id, email: req.user.email });
    
    next();
  } catch (error) {
    logger.error('❌ Error en autenticación:', error.message);
    
    return res.status(401).json({
      success: false,
      message: 'Token inválido o expirado',
      error: error.message
    });
  }
};

/**
 * Middleware de autorización por roles
 * Roles disponibles: admin, operador, chofer, usuario
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'No autenticado'
      });
    }

    if (!roles.includes(req.user.rol)) {
      logger.warn('⚠️ Acceso denegado por rol:', { 
        userId: req.user.id, 
        rol: req.user.rol, 
        rolesRequeridos: roles 
      });
      
      return res.status(403).json({
        success: false,
        message: 'No tienes permisos para realizar esta acción',
        requiredRoles: roles
      });
    }

    next();
  };
};

/**
 * Middleware para verificar permisos específicos por rol
 */
const checkPermission = (action) => {
  return (req, res, next) => {
    const permissions = {
      admin: ['all'],
      operador: ['view', 'create', 'edit', 'tracking'],
      chofer: ['view', 'tracking', 'update_status'],
      usuario: ['view', 'tracking']
    };

    const userPermissions = permissions[req.user.rol] || [];

    if (!userPermissions.includes(action) && !userPermissions.includes('all')) {
      return res.status(403).json({
        success: false,
        message: `No tienes permiso para: ${action}`
      });
    }

    next();
  };
};

/**
 * Middleware opcional de autenticación
 * Permite continuar sin token, pero agrega datos si existe
 */
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      
      req.user = {
        id: decoded.id,
        email: decoded.email,
        rol: decoded.rol
      };
    }
  } catch (error) {
    // No hacer nada, permitir continuar
  }
  
  next();
};

module.exports = {
  authenticate,
  authorize,
  optionalAuth,
  checkPermission
};
