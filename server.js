require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Multimedia = require('./models/multimedia');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

const uploadsPath = path.join(__dirname, 'uploads');

if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

// Configuración de Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsPath),
  filename: (req, file, cb) => {
    const nombreSeguro = Date.now() + '-' + file.originalname.replace(/\s+/g, '_');
    cb(null, nombreSeguro);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 200 * 1024 * 1024
  }
});

// Middlewares
app.use(express.json());
app.use('/uploads', express.static(uploadsPath));
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Conexión a MongoDB Atlas
mongoose.connect(MONGO_URI)
  .then(() => console.log('Conectado a MongoDB Atlas'))
  .catch(err => console.error('Error de conexión:', err.message));

// CREATE
app.post('/api/multimedia', (req, res) => {
  upload.fields([{ name: 'imagen' }, { name: 'audio' }])(req, res, async (err) => {
    if (err) {
      console.error('Error de Multer:', err.message);
      return res.status(500).json({ error: 'Error al subir archivo: ' + err.message });
    }

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
      console.error('Error al guardar:', err.message);
      res.status(500).json({ error: err.message });
    }
  });
});

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