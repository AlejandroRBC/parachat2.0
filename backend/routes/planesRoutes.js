const express = require('express');
const router = express.Router();
const planController = require('../controllers/planesController');
const { verifyToken } = require('../middleware/auth');

// Verificar que sea super admin
const verifySuperAdmin = (req, res, next) => {
    if (req.user.rol !== 'super_admin') {
        return res.status(403).json({ message: "Acceso denegado. Solo para Super Admin" });
    }
    next();
};

// Rutas de planes (protegidas para super admin)
router.get('/', verifyToken, verifySuperAdmin, planController.getPlanes);
router.post('/', verifyToken, verifySuperAdmin, planController.createPlan);
router.put('/:id', verifyToken, verifySuperAdmin, planController.updatePlan);
router.delete('/:id', verifyToken, verifySuperAdmin, planController.deletePlan);
router.get('/estadisticas', verifyToken, verifySuperAdmin, planController.getEstadisticasPlanes);

module.exports = router;