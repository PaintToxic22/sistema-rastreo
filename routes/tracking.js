const express = require('express');
const router = express.Router();
const EncomiendaModel = require('../models/Encomienda');
const { asyncHandler } = require('../middleware/errorHandler');
const { query } = require('../config/database');

/**
 * @route   GET /api/tracking/:codigo
 * @desc    Buscar encomienda u orden por código
 * @access  Public
 */
router.get('/:codigo', asyncHandler(async (req, res) => {
  const { codigo } = req.params;

  // Buscar en encomiendas
  if (codigo.startsWith('LQ')) {
    const encomienda = await EncomiendaModel.getByCodigo(codigo);
    
    if (!encomienda) {
      return res.status(404).json({
        success: false,
        message: 'Encomienda no encontrada',
        codigo
      });
    }

    // Obtener historial
    const historial = await query(
      'SELECT * FROM historial_tracking WHERE codigo_tracking = ? ORDER BY fecha_cambio ASC',
      [codigo]
    );

    return res.json({
      success: true,
      tipo: 'encomienda',
      data: encomienda,
      historial
    });
  }

  // Buscar en órdenes de flete
  if (codigo.startsWith('OF-')) {
    const orden = await query(
      'SELECT * FROM ordenes_flete WHERE numero_orden = ? AND activo = 1',
      [codigo]
    );

    if (!orden.length) {
      return res.status(404).json({
        success: false,
        message: 'Orden de flete no encontrada',
        codigo
      });
    }

    // Obtener historial
    const historial = await query(
      'SELECT * FROM historial_tracking WHERE codigo_tracking = ? ORDER BY fecha_cambio ASC',
      [codigo]
    );

    return res.json({
      success: true,
      tipo: 'orden_flete',
      data: orden[0],
      historial
    });
  }

  // Código no reconocido
  res.status(400).json({
    success: false,
    message: 'Formato de código no válido',
    formatos: {
      encomienda: 'LQ + 9 dígitos (ej: LQ123456789)',
      orden_flete: 'OF-YYYYMMDD-XXXX (ej: OF-20251103-0001)'
    }
  });
}));

module.exports = router;
