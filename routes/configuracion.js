const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/errorHandler');
const { query } = require('../config/database');
const { authenticate, authorize } = require('../middleware/auth');

/**
 * @route   GET /api/configuracion
 * @desc    Obtener configuración completa
 * @access  Public
 */
router.get('/', asyncHandler(async (req, res) => {
  const config = await query('SELECT clave, valor, tipo FROM configuracion');

  const configObj = {};
  config.forEach(item => {
    configObj[item.clave] = item.valor;
  });

  res.json({
    success: true,
    data: configObj
  });
}));

/**
 * @route   PUT /api/configuracion
 * @desc    Actualizar configuración
 * @access  Private (Admin)
 */
router.put('/', authenticate, authorize('admin'), asyncHandler(async (req, res) => {
  const updates = req.body;

  for (const [clave, valor] of Object.entries(updates)) {
    await query(
      'INSERT INTO configuracion (clave, valor, actualizado_por) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE valor = ?, actualizado_por = ?',
      [clave, valor, req.user.id, valor, req.user.id]
    );
  }

  res.json({
    success: true,
    message: 'Configuración actualizada exitosamente'
  });
}));

module.exports = router;
