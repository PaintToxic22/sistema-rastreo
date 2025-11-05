const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware para validar resultados
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors: errors.array()
    });
  }
  
  next();
};

/**
 * Validaciones para encomiendas
 */
const encomiendaValidation = {
  create: [
    body('codigo').optional().trim().isLength({ min: 5, max: 50 }),
    body('remitente_nombre').trim().notEmpty().withMessage('Nombre del remitente es requerido'),
    body('remitente_email').optional().isEmail().withMessage('Email del remitente inválido'),
    body('destinatario_nombre').trim().notEmpty().withMessage('Nombre del destinatario es requerido'),
    body('destinatario_direccion').trim().notEmpty().withMessage('Dirección del destinatario es requerida'),
    body('destinatario_email').optional().isEmail().withMessage('Email del destinatario inválido'),
    validate
  ],
  
  update: [
    param('id').isInt().withMessage('ID inválido'),
    body('estado').optional().isIn(['registrada', 'en_transito', 'en_reparto', 'entregada', 'devuelta', 'cancelada']),
    validate
  ],
  
  getById: [
    param('id').isInt().withMessage('ID inválido'),
    validate
  ],
  
  getByCodigo: [
    param('codigo').trim().notEmpty().withMessage('Código es requerido'),
    validate
  ]
};

/**
 * Validaciones para órdenes de flete
 */
const ordenFleteValidation = {
  create: [
    body('numero_orden').optional().trim().isLength({ min: 5, max: 50 }),
    body('remitente_nombre').trim().notEmpty().withMessage('Nombre del remitente es requerido'),
    body('remitente_rut').trim().notEmpty().withMessage('RUT del remitente es requerido')
      .matches(/^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/).withMessage('Formato de RUT inválido'),
    body('remitente_direccion').trim().notEmpty().withMessage('Dirección del remitente es requerida'),
    body('remitente_celular').trim().notEmpty().withMessage('Celular del remitente es requerido'),
    body('destinatario_nombre').trim().notEmpty().withMessage('Nombre del destinatario es requerido'),
    body('destinatario_rut').trim().notEmpty().withMessage('RUT del destinatario es requerido')
      .matches(/^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/).withMessage('Formato de RUT inválido'),
    body('destinatario_direccion').trim().notEmpty().withMessage('Dirección del destinatario es requerida'),
    body('destinatario_celular').trim().notEmpty().withMessage('Celular del destinatario es requerido'),
    body('valor_flete').isFloat({ min: 0 }).withMessage('Valor del flete inválido'),
    body('valor_seguro').optional().isFloat({ min: 0 }).withMessage('Valor del seguro inválido'),
    validate
  ],
  
  update: [
    param('id').isInt().withMessage('ID inválido'),
    body('estado').optional().isIn(['pendiente', 'confirmada', 'en_transito', 'entregada', 'cancelada']),
    validate
  ]
};

/**
 * Validaciones para usuarios
 */
const usuarioValidation = {
  register: [
    body('nombre').trim().notEmpty().withMessage('Nombre es requerido'),
    body('email').trim().isEmail().withMessage('Email inválido'),
    body('password').isLength({ min: 6 }).withMessage('Password debe tener al menos 6 caracteres'),
    body('rol').optional().isIn(['admin', 'operador', 'supervisor']),
    validate
  ],
  
  login: [
    body('email').trim().isEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('Password es requerido'),
    validate
  ],
  
  update: [
    param('id').isInt().withMessage('ID inválido'),
    body('nombre').optional().trim().notEmpty(),
    body('email').optional().trim().isEmail(),
    body('password').optional().isLength({ min: 6 }),
    validate
  ]
};

/**
 * Validaciones para configuración
 */
const configuracionValidation = {
  update: [
    body('clave').trim().notEmpty().withMessage('Clave es requerida'),
    body('valor').exists().withMessage('Valor es requerido'),
    validate
  ]
};

module.exports = {
  validate,
  encomiendaValidation,
  ordenFleteValidation,
  usuarioValidation,
  configuracionValidation
};
