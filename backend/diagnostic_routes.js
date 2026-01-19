const express = require('express');
const app = express();

console.log('🔍 DIAGNÓSTICO DE RUTAS CLIENTES-PÚBLICO\n');

// 1. Cargar tus rutas actuales
try {
    const clientePublicoRoutes = require('./routes/clientePublicoRoutes');
    app.use('/api/clientes-publico', clientePublicoRoutes);
    console.log('✅ Archivo de rutas cargado correctamente');
} catch (error) {
    console.log('❌ Error cargando rutas:', error.message);
}

// 2. Listar todas las rutas registradas
console.log('\n📋 RUTAS REGISTRADAS:');
app._router.stack.forEach((middleware) => {
    if (middleware.name === 'router') {
        console.log(`\n🔹 Prefijo: ${middleware.regexp}`);
        middleware.handle.stack.forEach((handler) => {
            if (handler.route) {
                const method = Object.keys(handler.route.methods)[0].toUpperCase();
                console.log(`   ${method} ${handler.route.path}`);
            }
        });
    }
});

// 3. Crear un servidor de prueba
const testApp = express();
testApp.use(express.json());

// Rutas de prueba DIRECTAS
testApp.post('/api/clientes-publico/login', (req, res) => {
    console.log('✅ Ruta /login alcanzada');
    res.json({ message: 'Login funcionando', data: req.body });
});

testApp.get('/api/clientes-publico/verify', (req, res) => {
    res.json({ message: 'Verify funcionando' });
});

testApp.get('/api/clientes-publico/microempresas', (req, res) => {
    res.json([{ id: 1, nombre: 'Test' }]);
});

console.log('\n🚀 Prueba estas URLs:');
console.log('   POST http://localhost:3001/api/clientes-publico/login');
console.log('   GET  http://localhost:3001/api/clientes-publico/verify');

// Iniciar servidor de prueba en puerto 3001
testApp.listen(3001, () => {
    console.log('\n🔧 Servidor de prueba en http://localhost:3001');
});