const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Encomienda = require('../models/Encomienda');
const Usuario = require('../models/Usuario');

// ============================================
// MIDDLEWARE AUTENTICACIÓN
// ============================================

const verificarToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;
    next();

  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token inválido o expirado'
    });
  }
};

// ============================================
// OBTENER TODAS LAS ENCOMIENDAS
// ============================================

router.get('/', verificarToken, async (req, res) => {
  try {
    const { estado, limit = 100, skip = 0 } = req.query;

    let filtro = {};

    // Filtrar por estado si se proporciona
    if (estado) {
      filtro.estado = estado;
    }

    // Filtrar por rol del usuario
    if (req.usuario.rol === 'chofer') {
      filtro.chofer = req.usuario.id;
    } else if (req.usuario.rol === 'usuario') {
      // Los usuarios solo ven sus propias encomiendas
      filtro.usuarioRegistro = req.usuario.id;
    }

    const encomiendas = await Encomienda
      .find(filtro)
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .populate('chofer', 'nombre email telefono')
      .sort({ fechaCreacion: -1 });

    const total = await Encomienda.countDocuments(filtro);

    res.json({
      success: true,
      data: encomiendas,
      total,
      limit: parseInt(limit),
      skip: parseInt(skip)
    });

  } catch (error) {
    console.error('Error obteniendo encomiendas:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// OBTENER ENCOMIENDA POR CÓDIGO
// ============================================

router.get('/codigo/:codigo', async (req, res) => {
  try {
    const { codigo } = req.params;

    const encomienda = await Encomienda
      .findOne({ codigo })
      .populate('chofer', 'nombre email telefono')
      .populate('usuarioRegistro', 'nombre email');

    if (!encomienda) {
      return res.status(404).json({
        success: false,
        message: 'Encomienda no encontrada'
      });
    }

    res.json({
      success: true,
      data: encomienda
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// OBTENER ENCOMIENDA POR ID
// ============================================

router.get('/:id', verificarToken, async (req, res) => {
  try {
    const encomienda = await Encomienda
      .findById(req.params.id)
      .populate('chofer', 'nombre email telefono')
      .populate('usuarioRegistro', 'nombre email');

    if (!encomienda) {
      return res.status(404).json({
        success: false,
        message: 'Encomienda no encontrada'
      });
    }

    res.json({
      success: true,
      data: encomienda
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// CREAR NUEVA ENCOMIENDA
// ============================================

router.post('/', verificarToken, async (req, res) => {
  try {
    // Solo operadores y admin pueden crear encomiendas
    if (!['operador', 'admin'].includes(req.usuario.rol)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para crear encomiendas'
      });
    }

    const {
      remitente_nombre,
      remitente_email,
      remitente_telefono,
      remitente_direccion,
      remitente_rut,
      destinatario_nombre,
      destinatario_email,
      destinatario_telefono,
      destinatario_direccion,
      destinatario_ciudad,
      destinatario_rut,
      valor_declarado
    } = req.body;

    // Validar campos requeridos
    if (!remitente_nombre || !destinatario_nombre || !destinatario_direccion) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos'
      });
    }

    // Crear encomienda
    const nuevaEncomienda = new Encomienda({
      remitente: {
        nombre: remitente_nombre,
        email: remitente_email,
        telefono: remitente_telefono,
        direccion: remitente_direccion,
        rut: remitente_rut
      },
      destinatario: {
        nombre: destinatario_nombre,
        email: destinatario_email,
        telefono: destinatario_telefono,
        direccion: destinatario_direccion,
        ciudad: destinatario_ciudad,
        rut: destinatario_rut
      },
      valor: valor_declarado || 0,
      usuarioRegistro: req.usuario.id,
      historial: [{
        estado: 'registrada',
        nota: 'Encomienda creada',
        usuario: req.usuario.email
      }]
    });

    await nuevaEncomienda.save();

    res.status(201).json({
      success: true,
      message: 'Encomienda creada exitosamente',
      data: nuevaEncomienda
    });

  } catch (error) {
    console.error('Error creando encomienda:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// ACTUALIZAR ESTADO DE ENCOMIENDA
// ============================================

router.patch('/:id/estado', verificarToken, async (req, res) => {
  try {
    const { estado } = req.body;

    if (!estado) {
      return res.status(400).json({
        success: false,
        message: 'Estado es requerido'
      });
    }

    const encomendaActualizada = await Encomienda.findByIdAndUpdate(
      req.params.id,
      {
        estado,
        $push: {
          historial: {
            estado,
            nota: `Estado cambió a ${estado}`,
            usuario: req.usuario.email
          }
        }
      },
      { new: true }
    );

    if (!encomendaActualizada) {
      return res.status(404).json({
        success: false,
        message: 'Encomienda no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Estado actualizado',
      data: encomendaActualizada
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// REGISTRAR ENTREGA
// ============================================

router.patch('/:id/entregar', verificarToken, async (req, res) => {
  try {
    const { persona_recibe, rut, observaciones } = req.body;

    // Validar que sea chofer
    if (req.usuario.rol !== 'chofer') {
      return res.status(403).json({
        success: false,
        message: 'Solo choferes pueden registrar entregas'
      });
    }

    if (!persona_recibe) {
      return res.status(400).json({
        success: false,
        message: 'Nombre de quién recibe es requerido'
      });
    }

    const encomendaActualizada = await Encomienda.findByIdAndUpdate(
      req.params.id,
      {
        estado: 'entregada',
        entrega: {
          fecha: new Date(),
          personaRecibe: persona_recibe,
          rut,
          observaciones
        },
        $push: {
          historial: {
            estado: 'entregada',
            nota: `Entregada a ${persona_recibe}`,
            usuario: req.usuario.email
          }
        }
      },
      { new: true }
    );

    if (!encomendaActualizada) {
      return res.status(404).json({
        success: false,
        message: 'Encomienda no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Entrega registrada exitosamente',
      data: encomendaActualizada
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// ASIGNAR CHOFER A ENCOMIENDA
// ============================================

router.patch('/:id/asignar-chofer', verificarToken, async (req, res) => {
  try {
    const { chofer_id } = req.body;

    // Solo operadores y admin
    if (!['operador', 'admin'].includes(req.usuario.rol)) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para asignar choferes'
      });
    }

    if (!chofer_id) {
      return res.status(400).json({
        success: false,
        message: 'ID del chofer es requerido'
      });
    }

    // Verificar que el chofer existe
    const chofer = await Usuario.findById(chofer_id);

    if (!chofer || chofer.rol !== 'chofer') {
      return res.status(404).json({
        success: false,
        message: 'Chofer no encontrado'
      });
    }

    const encomendaActualizada = await Encomienda.findByIdAndUpdate(
      req.params.id,
      {
        chofer: chofer_id,
        choferNombre: chofer.nombre,
        estado: 'en_transito',
        $push: {
          historial: {
            estado: 'en_transito',
            nota: `Asignada a chofer ${chofer.nombre}`,
            usuario: req.usuario.email
          }
        }
      },
      { new: true }
    ).populate('chofer', 'nombre email telefono');

    if (!encomendaActualizada) {
      return res.status(404).json({
        success: false,
        message: 'Encomienda no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Chofer asignado exitosamente',
      data: encomendaActualizada
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// OBTENER ESTADÍSTICAS
// ============================================

router.get('/estadisticas', verificarToken, async (req, res) => {
  try {
    const total = await Encomienda.countDocuments();
    const registradas = await Encomienda.countDocuments({ estado: 'registrada' });
    const en_transito = await Encomienda.countDocuments({ estado: 'en_transito' });
    const entregadas = await Encomienda.countDocuments({ estado: 'entregada' });

    res.json({
      success: true,
      data: {
        total,
        registradas,
        en_transito,
        entregadas
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;