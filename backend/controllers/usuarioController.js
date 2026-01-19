const db = require('../config/db');
const bcrypt = require('bcryptjs');

// OBTENER USUARIOS
exports.getUsuarios = async (req, res) => {
    try {
        let query = '';
        let params = [];

        if (req.user.rol === 'super_admin') {
            query = `SELECT u.*, r.tipo_rol, m.nombre as empresa_nombre 
                    FROM USUARIO u 
                    JOIN ROL r ON u.rol_id = r.id_rol 
                    LEFT JOIN MICROEMPRESA m ON u.microempresa_id = m.id_microempresa
                    ORDER BY u.fecha_creacion DESC`;
        } else if (['administrador', 'microempresa_P'].includes(req.user.rol)) {
            query = `SELECT u.*, r.tipo_rol 
                    FROM USUARIO u 
                    JOIN ROL r ON u.rol_id = r.id_rol 
                    WHERE u.microempresa_id = ? AND u.rol_id != 1
                    ORDER BY u.fecha_creacion DESC`;
            params = [req.user.microempresa_id];
        } else {
            return res.status(403).json({ message: "Acceso denegado" });
        }

        const [rows] = await db.execute(query, params);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// CREAR USUARIO
exports.createUsuario = async (req, res) => {
    const { nombre, apellido, email, password, rol_id } = req.body;
    
    try {
        const [existe] = await db.execute('SELECT * FROM USUARIO WHERE email = ?', [email]);
        if (existe.length > 0) {
            return res.status(400).json({ message: "El correo ya está registrado" });
        }

        let microempresa_id = req.user.microempresa_id;
        
        if (req.user.rol === 'super_admin' && req.body.microempresa_id) {
            microempresa_id = req.body.microempresa_id;
        }

        if (rol_id == 1 && req.user.rol !== 'super_admin') {
            return res.status(403).json({ message: "No puedes crear usuarios super admin" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await db.execute(
            'INSERT INTO USUARIO (nombre, apellido, email, password, microempresa_id, rol_id) VALUES (?, ?, ?, ?, ?, ?)',
            [nombre, apellido, email, hashedPassword, microempresa_id, rol_id]
        );

        res.status(201).json({ message: "Usuario creado con éxito" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al crear usuario" });
    }
};

// ACTUALIZAR ESTADO DE USUARIO
exports.updateEstado = async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;
    
    try {
        const [usuario] = await db.execute(
            'SELECT microempresa_id, rol_id FROM USUARIO WHERE id_usuario = ?',
            [id]
        );

        if (usuario.length === 0) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        if (req.user.rol !== 'super_admin') {
            if (usuario[0].microempresa_id !== req.user.microempresa_id) {
                return res.status(403).json({ message: "No puedes modificar usuarios de otra empresa" });
            }
            if (usuario[0].rol_id == 1) {
                return res.status(403).json({ message: "No puedes modificar super admins" });
            }
        }

        await db.execute(
            'UPDATE USUARIO SET estado = ? WHERE id_usuario = ?',
            [estado, id]
        );

        res.json({ message: `Usuario ${estado === 'activo' ? 'activado' : 'desactivado'} exitosamente` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// --- NUEVA FUNCIÓN: ACTUALIZAR PERFIL (CON FOTO) ---
exports.actualizarPerfil = async (req, res) => {
    try {
        const { nombre, apellido, telefono } = req.body;
        const id_usuario = req.user.id; // Asumiendo que tu verifyToken guarda el ID en req.user.id
        let foto_url = null;

        // Si multer procesó una foto
        if (req.file) {
            foto_url = req.file.filename;
        }

        let query;
        let params;

        if (foto_url) {
            // Actualización incluyendo la nueva foto
            query = 'UPDATE USUARIO SET nombre = ?, apellido = ?, telefono = ?, foto_url = ? WHERE id_usuario = ?';
            params = [nombre, apellido, telefono, foto_url, id_usuario];
        } else {
            // Actualización sin cambiar la foto actual
            query = 'UPDATE USUARIO SET nombre = ?, apellido = ?, telefono = ? WHERE id_usuario = ?';
            params = [nombre, apellido, telefono, id_usuario];
        }

        await db.execute(query, params);

        res.json({ 
            message: "Perfil actualizado correctamente",
            foto_url: foto_url // Enviamos esto para que el frontend actualice la imagen
        });

    } catch (error) {
        console.error("Error en actualizarPerfil:", error);
        res.status(500).json({ message: "Error interno al actualizar el perfil" });
    }
};