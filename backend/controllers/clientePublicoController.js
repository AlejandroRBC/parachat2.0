const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// REGISTRO DE CLIENTE PÚBLICO
exports.registrarClientePublico = async (req, res) => {
    console.log('📝 Registro de cliente público recibido:', req.body);
    
    const { nombre, email, telefono, password } = req.body;

    try {
        // Verificar si el email ya está registrado
        const [existe] = await db.execute('SELECT * FROM CLIENTE WHERE email = ?', [email]);
        if (existe.length > 0) {
            return res.status(400).json({ message: "El correo ya está registrado como cliente" });
        }

        // Encriptar la contraseña si se proporciona
        let hashedPassword = null;
        if (password) {
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(password, salt);
        }

        // Insertar cliente público
        const [result] = await db.execute(
            'INSERT INTO CLIENTE (nombre_razon_social, email, telefono, password, origen, estado) VALUES (?, ?, ?, ?, "publico", "activo")',
            [nombre, email, telefono || null, hashedPassword]
        );

        console.log('✅ Cliente registrado con ID:', result.insertId);

        // Generar token
        const token = jwt.sign(
            { 
                id: result.insertId, 
                nombre: nombre,
                email: email,
                tipo: 'cliente_publico'
            },
            process.env.JWT_SECRET || 'secret_key_fallback',
            { expiresIn: '24h' }
        );

        res.status(201).json({ 
            message: "Registro exitoso", 
            token: token,
            cliente: {
                id: result.insertId,
                nombre: nombre,
                email: email,
                telefono: telefono
            }
        });
    } catch (error) {
        console.error('❌ Error registro cliente público:', error);
        res.status(500).json({ 
            error: "Error al registrar cliente",
            details: error.message 
        });
    }
};

// LOGIN DE CLIENTE PÚBLICO
exports.loginClientePublico = async (req, res) => {
    const { email, password } = req.body;

    try {
        const [rows] = await db.execute(
            'SELECT * FROM CLIENTE WHERE email = ?',
            [email]
        );

        if (rows.length === 0) {
            return res.status(404).json({ message: "Cliente no encontrado" });
        }

        const cliente = rows[0];

        // Verificar contraseña
        const validPass = await bcrypt.compare(password, cliente.password);
        if (!validPass) {
            return res.status(401).json({ message: "Contraseña incorrecta" });
        }

        // Generar token
        const token = jwt.sign(
            { 
                id: cliente.id_cliente, 
                nombre: cliente.nombre_razon_social,
                email: cliente.email,
                tipo: 'cliente_publico'
            },
            process.env.JWT_SECRET || 'secret_key_fallback',
            { expiresIn: '24h' }
        );

        res.json({
            token,
            cliente: {
                id: cliente.id_cliente,
                nombre: cliente.nombre_razon_social,
                email: cliente.email,
                telefono: cliente.telefono
            }
        });
    } catch (error) {
        console.error('Error login cliente:', error);
        res.status(500).json({ error: "Error en el servidor" });
    }
};

// OBTENER MICROEMPRESAS ACTIVAS
exports.getMicroempresasPublico = async (req, res) => {
    try {
        const query = `
            SELECT 
                m.id_microempresa, 
                m.nombre, 
                m.direccion, 
                m.telefono,
                m.rubro,
                m.descripcion,
                COUNT(p.id_producto) as productos_count
            FROM MICROEMPRESA m
            LEFT JOIN PRODUCTO p ON m.id_microempresa = p.microempresa_id AND p.estado = 'stock'
            WHERE m.estado = 'activa'
            GROUP BY m.id_microempresa
            ORDER BY m.nombre
        `;

        const [rows] = await db.execute(query);
        console.log(`✅ Se encontraron ${rows.length} microempresas activas`);
        res.json(rows);
    } catch (error) {
        console.error('❌ Error obteniendo microempresas:', error);
        res.status(500).json({ error: error.message });
    }
};

// VERIFICAR TOKEN DE CLIENTE
exports.verifyClienteToken = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ valid: false, message: "No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_fallback');
        
        if (decoded.tipo !== 'cliente_publico') {
            return res.status(401).json({ valid: false, message: "Token inválido" });
        }

        const [rows] = await db.execute(
            'SELECT id_cliente, nombre_razon_social as nombre, email, telefono FROM CLIENTE WHERE id_cliente = ?',
            [decoded.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ valid: false, message: "Cliente no encontrado" });
        }

        res.json({
            valid: true,
            cliente: rows[0]
        });
    } catch (error) {
        console.error('Error verificando token:', error);
        res.status(401).json({ valid: false, message: "Token inválido o expirado" });
    }
};

// REGISTRAR VISITA A MICROEMPRESA
exports.registrarVisita = async (req, res) => {
    const { cliente_id, microempresa_id } = req.body;

    try {
        // Primero, registrar la visita
        await db.execute(
            'INSERT INTO VISITA_MICROEMPRESA (cliente_id, microempresa_id, fecha_visita) VALUES (?, ?, NOW())',
            [cliente_id, microempresa_id]
        );

        // Luego, asociar el cliente a la microempresa si no lo está ya
        const [existe] = await db.execute(
            'SELECT microempresa_id FROM CLIENTE WHERE id_cliente = ?',
            [cliente_id]
        );

        // Si el cliente no tiene microempresa_id, asignársela
        if (existe.length > 0 && !existe[0].microempresa_id) {
            await db.execute(
                'UPDATE CLIENTE SET microempresa_id = ? WHERE id_cliente = ?',
                [microempresa_id, cliente_id]
            );
        }

        res.json({ 
            message: "Visita registrada exitosamente",
            asociado: true
        });
    } catch (error) {
        console.error('Error registrando visita:', error);
        res.status(500).json({ error: error.message });
    }
};

// OBTENER PRODUCTOS DE MICROEMPRESA
exports.getProductosMicroempresa = async (req, res) => {
    const { id } = req.params;

    try {
        const query = `
            SELECT 
                p.id_producto,
                p.nombre,
                p.descripcion,
                p.precio,
                p.stock_actual,
                p.categoria,
                m.nombre as empresa_nombre,
                m.rubro as empresa_rubro
            FROM PRODUCTO p
            JOIN MICROEMPRESA m ON p.microempresa_id = m.id_microempresa
            WHERE p.microempresa_id = ? AND p.estado = 'stock'
            ORDER BY p.nombre
        `;

        const [rows] = await db.execute(query, [id]);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};