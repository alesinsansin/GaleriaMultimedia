const mongoose = require('mongoose');

const ElementoMultimediaSchema = new mongoose.Schema({
  titulo: { type: String, required: true },
  descripcion: String,
  imagenUrl: { type: String, required: true },
  audioUrl: { type: String, required: true },
  tags: { type: [String], default: [] },
  fechaCreacion: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Multimedia', ElementoMultimediaSchema);