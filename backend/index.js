const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();

// --- 1. CONFIGURACIÓN DE CARPETA DE CARGAS ---
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
    console.log('📁 Carpeta /uploads creada automáticamente');
}

// --- 2. MIDDLEWARES ---
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configuración de CORS más amplia
app.use(cors({
    origin: ['http://localhost:5174', 'http://localhost:5173', 'http://127.0.0.1:5174', 'http://localhost:5175'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parsear JSON y formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- 3. IMPORTAR RUTAS ---
const authRoutes = require('./routes/authRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const passwordRoutes = require('./routes/passwordRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const clientePublicoRoutes = require('./routes/clientePublicoRoutes')
const superAdminRoutes = require('./routes/superAdminRoutes');

// --- 4. USO DE RUTAS ---
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/password', passwordRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/clientes-publico', clientePublicoRoutes); 
app.use('/api/super-admin', superAdminRoutes);

// --- 5. ENDPOINTS DE PRUEBA PARA VERIFICAR ---
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'Backend funcionando ✅',
        timestamp: new Date().toISOString(),
        port: process.env.PORT
    });
});

app.get('/api/test-clientes-publico', (req, res) => {
    res.json({ 
        message: 'Ruta clientes-publico activa ✅',
        timestamp: new Date().toISOString()
    });
});

app.post('/api/test-post', (req, res) => {
    res.json({ 
        message: 'POST funcionando ✅',
        data: req.body,
        timestamp: new Date().toISOString()
    });
});

// Ruta para verificar todas las rutas registradas
app.get('/api/routes', (req, res) => {
    const routes = [];
    app._router.stack.forEach((middleware) => {
        if (middleware.route) {
            routes.push({
                path: middleware.route.path,
                methods: Object.keys(middleware.route.methods)
            });
        } else if (middleware.name === 'router') {
            middleware.handle.stack.forEach((handler) => {
                if (handler.route) {
                    routes.push({
                        path: handler.route.path,
                        methods: Object.keys(handler.route.methods)
                    });
                }
            });
        }
    });
    res.json(routes);
});
// 2. LOGIN (¡FALTA ESTA!)
app.post('/api/clientes-publico/login', (req, res) => {
    console.log('🔐 [CLIENTE] POST /login - Datos:', req.body);
    
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ 
            message: "Email y contraseña son requeridos" 
        });
    }
    
    // Respuesta de prueba - después implementar con BD
    res.json({
        success: true,
        message: 'Login exitoso',
        token: 'jwt_login_token_' + Date.now(),
        cliente: {
            id: 3, // Mismo ID que se registró
            nombre: email.split('@')[0] || 'Usuario',
            email: email,
            telefono: 'N/A'
        }
    });
});

// 3. VERIFY (¡FALTA ESTA!)
app.get('/api/clientes-publico/verify', (req, res) => {
    const token = req.headers.authorization;
    console.log('🔍 [CLIENTE] GET /verify - Token:', token ? 'PRESENTE' : 'AUSENTE');
    
    res.json({
        valid: true,
        message: 'Token válido',
        cliente: {
            id: 3,
            nombre: 'Cliente Verificado',
            email: 'son@gmail.com' // El email que se registró
        }
    });
});

// 5. VISITA (¡FALTA ESTA!)
app.post('/api/clientes-publico/visita', (req, res) => {
    console.log('📍 [CLIENTE] POST /visita - Datos:', req.body);
    
    const { cliente_id, microempresa_id } = req.body;
    
    res.json({
        success: true,
        message: 'Visita registrada',
        cliente_id: cliente_id,
        microempresa_id: microempresa_id,
        asociado: true
    });
});

// --- 6. MANEJO DE ERRORES 404 ---
app.use((req, res, next) => {
    console.log(`❌ Ruta no encontrada: ${req.method} ${req.url}`);
    res.status(404).json({ 
        error: 'Ruta no encontrada',
        method: req.method,
        url: req.url,
        availableRoutes: [
            'GET  /api/test',
            'POST /api/test-post',
            'GET  /api/routes',
            'POST /api/auth/register',
            'POST /api/auth/login',
            'GET  /api/auth/microempresas',
            'POST /api/clientes-publico/registrar',
            'POST /api/clientes-publico/login',
            'GET  /api/clientes-publico/microempresas'
        ]
    });
});

// --- 7. INICIO DEL SERVIDOR ---
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`\n🚀 ==========================================`);
    console.log(`✅ Servidor backend corriendo en:`);
    console.log(`   Punto de acceso: http://localhost:${PORT}`);
    console.log(`   Carpeta uploads: http://localhost:${PORT}/uploads`);
    console.log(`\n✅ Endpoints activos:`);
    console.log(`   • Auth: /api/auth/*`);
    console.log(`   • Usuarios: /api/usuarios/*`);
    console.log(`   • Password: /api/password/*`);
    console.log(`   • Clientes: /api/clientes/*`);
    console.log(`   • Clientes Públicos: /api/clientes-publico/*`);
    console.log(`\n🔍 Endpoints de prueba:`);
    console.log(`   • GET  http://localhost:${PORT}/api/test`);
    console.log(`   • POST http://localhost:${PORT}/api/test-post`);
    console.log(`   • GET  http://localhost:${PORT}/api/routes`);
    console.log(`🚀 ==========================================\n`);
});