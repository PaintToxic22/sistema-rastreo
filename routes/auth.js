const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

// ============================================
// LOGIN
// ============================================

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar entrada
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email y contraseña son requeridos'
      });
    }

    // Buscar usuario
    const usuario = await Usuario.findOne({ email }).select('+password');

    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Email o contraseña incorrectos'
      });
    }

    // Verificar contraseña
    const passwordCorrecto = await usuario.compararPassword(password);

    if (!passwordCorrecto) {
      return res.status(401).json({
        success: false,
        message: 'Email o contraseña incorrectos'
      });
    }

    // Generar JWT
    const token = jwt.sign(
      {
        id: usuario._id,
        email: usuario.email,
        rol: usuario.rol
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      message: 'Login exitoso',
      data: {
        token,
        user: usuario.toJSON()
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ============================================
// REGISTRAR NUEVO USUARIO
// ============================================

router.post('/registro', async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    // Validar entrada
    if (!nombre || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, email y contraseña son requeridos'
      });
    }

    // Verificar que el email no exista
    const usuarioExistente = await Usuario.findOne({ email });

    if (usuarioExistente) {
      return res.status(400).json({
        success: false,
        message: 'El email ya está registrado'
      });
    }

    // Crear nuevo usuario
    const nuevoUsuario = new Usuario({
      nombre,
      email,
      password,
      rol: rol || 'usuario'
    });

    // Guardar usuario
    await nuevoUsuario.save();

    // Generar token
    const token = jwt.sign(
      {
        id: nuevoUsuario._id,
        email: nuevoUsuario.email,
        rol: nuevoUsuario.rol
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      data: {
        token,
        user: nuevoUsuario.toJSON()
      }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ============================================
// OBTENER USUARIO ACTUAL
// ============================================

router.get('/me', async (req, res) => {
  try {
    // Obtener token del header
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado'
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Obtener usuario
    const usuario = await Usuario.findById(decoded.id);

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado'
      });
    }

    res.json({
      success: true,
      data: usuario.toJSON()
    });

  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    res.status(401).json({
      success: false,
      message: 'Token inválido o expirado'
    });
  }
});

// ============================================
// LOGOUT
// ============================================

router.post('/logout', (req, res) => {
  // En JWT, logout es responsabilidad del frontend
  // (borrar token del localStorage)
  res.json({
    success: true,
    message: 'Logout exitoso'
  });
});

module.exports = router;