const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
// IMPORTANTE: Verifica que el nombre del archivo en controllers coincide
const usuarioController = require('../controllers/usuarioController');
const { verifyToken } = require('../middleware/auth');

// Configuración de Multer
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, `perfil-${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage });

// Rutas existentes
router.get('/', verifyToken, usuarioController.getUsuarios);
router.post('/', verifyToken, usuarioController.createUsuario);
router.put('/estado/:id', verifyToken, usuarioController.updateEstado);

// Nueva ruta de perfil con subida de foto
router.put('/perfil', [verifyToken, upload.single('foto')], usuarioController.actualizarPerfil);

module.exports = router;