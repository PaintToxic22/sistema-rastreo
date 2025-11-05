const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticate } = require('../middleware/auth');
const config = require('../config/config');

// Configurar multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = config.uploads.destination;
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (config.uploads.allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de archivo no permitido'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: config.uploads.maxFileSize },
  fileFilter
});

/**
 * @route   POST /api/upload/logo
 * @desc    Subir logo de empresa
 * @access  Private (Admin)
 */
router.post('/logo', authenticate, upload.single('logo'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No se recibió ningún archivo'
    });
  }

  const fileUrl = `/uploads/${req.file.filename}`;

  res.json({
    success: true,
    message: 'Logo subido exitosamente',
    data: {
      filename: req.file.filename,
      url: fileUrl,
      size: req.file.size,
      mimetype: req.file.mimetype
    }
  });
}));

module.exports = router;
