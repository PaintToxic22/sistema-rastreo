const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/errorHandler');
const { query } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @route   GET /api/ordenes
 * @desc    Obtener todas las órdenes de flete
 * @access  Private
 */
router.get('/', authenticate, asyncHandler(async (req, res) => {
  let sql = 'SELECT * FROM ordenes_flete WHERE activo = 1 ORDER BY fecha_emision DESC';
  
  if (req.query.limit) {
    sql += ` LIMIT ${parseInt(req.query.limit)}`;
  }

  const ordenes = await query(sql);

  res.json({
    success: true,
    count: ordenes.length,
    data: ordenes
  });
}));

/**
 * @route   POST /api/ordenes
 * @desc    Crear nueva orden de flete
 * @access  Private
 */
router.post('/', authenticate, asyncHandler(async (req, res) => {
  const {
    numero_orden,
    remitente_nombre,
    remitente_rut,
    remitente_direccion,
    remitente_celular,
    remitente_email,
    destinatario_nombre,
    destinatario_rut,
    destinatario_direccion,
    destinatario_celular,
    destinatario_email,
    valor_flete,
    valor_seguro,
    descripcion_mercancia,
    observaciones,
    tipo_generacion
  } = req.body;

  const valor_total = parseFloat(valor_flete) + (parseFloat(valor_seguro) || 0);

  const sql = `
    INSERT INTO ordenes_flete (
      numero_orden, fecha_emision, remitente_nombre, remitente_rut,
      remitente_direccion, remitente_celular, remitente_email,
      destinatario_nombre, destinatario_rut, destinatario_direccion,
      destinatario_celular, destinatario_email, valor_flete,
      valor_seguro, valor_total, descripcion_mercancia,
      observaciones, tipo_generacion, usuario_registro_id
    ) VALUES (?, CURDATE(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const result = await query(sql, [
    numero_orden,
    remitente_nombre,
    remitente_rut,
    remitente_direccion,
    remitente_celular,
    remitente_email || null,
    destinatario_nombre,
    destinatario_rut,
    destinatario_direccion,
    destinatario_celular,
    destinatario_email || null,
    valor_flete,
    valor_seguro || 0,
    valor_total,
    descripcion_mercancia || null,
    observaciones || null,
    tipo_generacion || 'manual',
    req.user.id
  ]);

  res.status(201).json({
    success: true,
    message: 'Orden de flete creada exitosamente',
    data: {
      id: result.insertId,
      numero_orden
    }
  });
}));

module.exports = router;
