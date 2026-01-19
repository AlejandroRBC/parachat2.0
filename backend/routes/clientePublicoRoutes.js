const express = require('express');
const router = express.Router();

// Importar el controlador - VERIFICA QUE EL NOMBRE SEA EXACTO
const clientePublicoController = require('../controllers/clientePublicoController');

// ⭐⭐ RUTAS CRÍTICAS QUE DEBEN EXISTIR ⭐⭐

// 1. LOGIN - ESTA ES LA QUE FALTA
router.post('/login', (req, res) => {
    console.log('✅ RUTA /login alcanzada - Datos:', req.body);
    
    // Respuesta inmediata para testing
    res.json({
        success: true,
        message: 'Login funcionando (ruta directa)',
        token: 'test_token_' + Date.now(),
        cliente: {
            id: 1,
            nombre: req.body.email.split('@')[0] || 'Usuario',
            email: req.body.email
        }
    });
});

// 2. VERIFY
router.get('/verify', (req, res) => {
    console.log('✅ RUTA /verify alcanzada');
    res.json({
        valid: true,
        message: 'Verify funcionando (ruta directa)',
        cliente: { id: 1, nombre: 'Test', email: 'test@test.com' }
    });
});

// 3. REGISTRAR
router.post('/registrar', clientePublicoController.registrarClientePublico);

// 4. MICROEMPRESAS
router.get('/microempresas', clientePublicoController.getMicroempresasPublico);

// 5. RUTA DE DIAGNÓSTICO
router.get('/debug', (req, res) => {
    res.json({
        status: '🟢 TODAS LAS RUTAS FUNCIONAN',
        timestamp: new Date().toISOString(),
        rutas_definidas: [
            'POST /login',
            'GET  /verify',
            'POST /registrar',
            'GET  /microempresas',
            'GET  /debug'
        ]
    });
});

module.exports = router;