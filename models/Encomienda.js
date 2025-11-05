const mongoose = require('mongoose');

const encomendaSchema = new mongoose.Schema({
  codigo: {
    type: String,
    required: true,
    unique: true
  },
  remitente: {
    nombre: String,
    email: String,
    telefono: String,
    direccion: String
  },
  destinatario: {
    nombre: String,
    email: String,
    telefono: String,
    direccion: String,
    ciudad: String
  },
  estado: {
    type: String,
    enum: ['registrada', 'en_transito', 'en_reparto', 'entregada', 'devuelta'],
    default: 'registrada'
  },
  valor: {
    type: Number,
    default: 0
  },
  chofer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario'
  },
  entrega: {
    fecha: Date,
    personaRecibe: String,
    rut: String,
    observaciones: String
  },
  historial: [{
    estado: String,
    fecha: {
      type: Date,
      default: Date.now
    },
    nota: String
  }],
  fechaCreacion: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Encomienda = mongoose.model('Encomienda', encomendaSchema, 'encomiendas');

module.exports = Encomienda;