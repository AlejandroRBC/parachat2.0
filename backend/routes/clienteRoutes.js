const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');
const { verifyToken } = require('../middleware/auth');

router.post('/', verifyToken, clienteController.createCliente);
router.get('/', verifyToken, clienteController.getClientes);
router.get('/eliminados', verifyToken, clienteController.getEliminados);
router.put('/:id', verifyToken, clienteController.updateCliente);
router.delete('/:id', verifyToken, clienteController.deleteCliente);
router.get('/search', verifyToken, clienteController.searchClientes);
router.get('/microempresa/:microempresa_id', verifyToken, clienteController.getClientesByMicroempresa);
router.put('/reactivar/:id', verifyToken, clienteController.reactivarCliente);

module.exports = router;