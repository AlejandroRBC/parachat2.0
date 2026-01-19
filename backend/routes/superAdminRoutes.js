const express = require('express');
const router = express.Router();
const superAdminController = require('../controllers/superAdminController');
const { verifyToken } = require('../middleware/auth');

// Verificar que sea super admin
const verifySuperAdmin = (req, res, next) => {
    if (req.user.rol !== 'super_admin') {
        return res.status(403).json({ message: "Acceso denegado. Solo para Super Admin" });
    }
    next();
};

// Rutas de super admin
router.get('/clientes', verifyToken, verifySuperAdmin, superAdminController.getClientesCompleto);
router.get('/estadisticas', verifyToken, verifySuperAdmin, superAdminController.getEstadisticas);
router.get('/microempresas-completo', verifyToken, verifySuperAdmin, superAdminController.getMicroempresasCompleto);
router.get('/planes-completo', verifyToken, verifySuperAdmin, superAdminController.getPlanesCompleto);

module.exports = router;