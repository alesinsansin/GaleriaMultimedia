require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Multimedia = require('./models/multimedia');

const app = express();
const PORT = process.env.PORT || 3000;

// Crear carpeta uploads si no existe
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Configuración de Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Middlewares
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(__dirname));

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Conexión a MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Conectado a MongoDB Atlas'))
  .catch(err => console.error('Error de conexión:', err));

// CREATE
app.post(
  '/api/multimedia',
  upload.fields([{ name: 'imagen' }, { name: 'audio' }]),
  async (req, res) => {
    try {
      if (!req.files || !req.files.imagen || !req.files.audio) {
        return res.status(400).json({
          error: 'Debes subir una imagen y un audio'
        });
      }

      const nuevo = new Multimedia({
        titulo: req.body.titulo,
        descripcion: req.body.descripcion,
        imagenUrl: '/uploads/' + req.files.imagen[0].filename,
        audioUrl: '/uploads/' + req.files.audio[0].filename,
        tags: req.body.tags
          ? req.body.tags.split(',').map(t => t.trim())
          : []
      });

      await nuevo.save();

      res.json({
        mensaje: 'Elemento guardado correctamente',
        nuevo
      });

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// READ
app.get('/api/multimedia', async (req, res) => {
  try {
    const elementos = await Multimedia.find().sort({ fechaCreacion: -1 });
    res.json(elementos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE
app.put('/api/multimedia/:id', async (req, res) => {
  try {
    const actualizado = await Multimedia.findByIdAndUpdate(
      req.params.id,
      {
        titulo: req.body.titulo,
        descripcion: req.body.descripcion,
        tags: req.body.tags || []
      },
      { new: true }
    );

    res.json(actualizado);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE
app.delete('/api/multimedia/:id', async (req, res) => {
  try {
    await Multimedia.findByIdAndDelete(req.params.id);

    res.json({
      mensaje: 'Elemento eliminado correctamente'
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor en puerto ${PORT}`);
});