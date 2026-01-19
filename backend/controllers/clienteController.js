const db = require('../config/db');

// 1. REGISTRAR (Estándar para todos)
exports.createCliente = async (req, res) => {
    // 1. Extraemos los datos del cuerpo de la petición
    const { nombre_razon_social, ci_nit, telefono, email } = req.body;
    const microempresa_id = req.user.microempresa_id; 

    try {
        // 2. Si el email viene vacío o no existe, le asignamos NULL
        const emailFinal = (email && email.trim() !== '') ? email : null;

        await db.execute(
            'INSERT INTO CLIENTE (nombre_razon_social, ci_nit, telefono, email, microempresa_id) VALUES (?, ?, ?, ?, ?)',
            [nombre_razon_social, ci_nit, telefono, emailFinal, microempresa_id]
        );
        res.status(201).json({ message: "Cliente registrado con éxito" });
    } catch (error) {
        // IMPORTANTE: Revisa tu consola de Node.js si esto falla
        console.error("ERROR EN SQL:", error); 
        res.status(500).json({ error: error.message });
    }
};

// 2. MODIFICAR (Aislamiento por microempresa)
exports.updateCliente = async (req, res) => {
    const { id } = req.params;
    const { nombre_razon_social } = req.body; // Puedes agregar más campos aquí si lo necesitas
    const { rol, microempresa_id } = req.user;

    try {
        let query = '';
        let params = [];

        // Lógica de seguridad:
        // Si es Super Admin, podría editar cualquiera (opcional), 
        // pero por seguridad mantenemos que solo el dueño edite sus datos.
        // Aquí usamos la lógica estricta:
        query = 'UPDATE CLIENTE SET nombre_razon_social = ? WHERE id_cliente = ? AND microempresa_id = ?';
        params = [nombre_razon_social, id, microempresa_id];

        // NOTA: Si quisieras que el Super Admin edite cualquier cliente, avísame para cambiar el WHERE.

        const [result] = await db.execute(query, params);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Cliente no encontrado o no tienes permiso para editarlo" });
        }

        res.json({ message: "Datos modificados exitosamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3. BUSCAR TODOS (Lógica Inteligente: Super Admin ve TODO)
exports.getClientes = async (req, res) => {
    const { rol, microempresa_id } = req.user; 

    try {
        let query = '';
        let params = [];

        if (rol === 'super_admin') {
            // SUPER ADMIN: Ve clientes de TODAS las empresas + Nombre de la empresa
            query = `
                SELECT c.*, m.nombre as empresa_nombre 
                FROM CLIENTE c 
                JOIN MICROEMPRESA m ON c.microempresa_id = m.id_microempresa 
                WHERE c.estado = 'activo'
                ORDER BY c.id_cliente DESC
            `;
        } else {
            // MORTALES (Admin/Vendedor): Solo ven su empresa
            query = `
                SELECT * FROM CLIENTE 
                WHERE microempresa_id = ? AND estado = 'activo'
                ORDER BY id_cliente DESC
            `;
            params = [microempresa_id];
        }

        const [rows] = await db.execute(query, params);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// 4. ELIMINAR (Borrado Lógico)
exports.deleteCliente = async (req, res) => {
    const { id } = req.params;
    const microempresa_id = req.user.microempresa_id;

    try {
        // Solo borra si coincide el ID y la EMPRESA
        const [result] = await db.execute(
            'UPDATE CLIENTE SET estado = "inactivo" WHERE id_cliente = ? AND microempresa_id = ?',
            [id, microempresa_id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "No se pudo eliminar (no encontrado o sin permiso)" });
        }

        res.json({ message: "Cliente eliminado lógicamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 5. MOSTRAR ELIMINADOS (Lógica Inteligente aplicada también aquí)
exports.getEliminados = async (req, res) => {
    const { rol, microempresa_id } = req.user;

    try {
        let query = '';
        let params = [];

        if (rol === 'super_admin') {
            // El Super Admin también ve los ELIMINADOS de todos
            query = `
                SELECT c.*, m.nombre as empresa_nombre 
                FROM CLIENTE c 
                JOIN MICROEMPRESA m ON c.microempresa_id = m.id_microempresa 
                WHERE c.estado = 'inactivo'
                ORDER BY c.id_cliente DESC
            `;
        } else {
            // Usuarios normales solo ven sus eliminados
            query = `
                SELECT * FROM CLIENTE 
                WHERE microempresa_id = ? AND estado = 'inactivo'
                ORDER BY id_cliente DESC
            `;
            params = [microempresa_id];
        }

        const [rows] = await db.execute(query, params);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 6. BUSCAR CLIENTES POR MICROEMPRESA (para Super Admin)
exports.getClientesByMicroempresa = async (req, res) => {
    const { microempresa_id } = req.params;
    const { rol } = req.user;

    try {
        if (rol !== 'super_admin') {
            return res.status(403).json({ message: "Acceso denegado" });
        }

        const query = `
            SELECT c.*, m.nombre as empresa_nombre 
            FROM CLIENTE c 
            LEFT JOIN MICROEMPRESA m ON c.microempresa_id = m.id_microempresa 
            WHERE c.microempresa_id = ? AND c.estado = 'activo'
            ORDER BY c.nombre_razon_social
        `;

        const [rows] = await db.execute(query, [microempresa_id]);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// 7. BUSCAR CLIENTES CON FILTROS (para Super Admin)
exports.searchClientes = async (req, res) => {
    const { search, microempresa_id, origen } = req.query;
    const { rol } = req.user;

    try {
        if (rol !== 'super_admin') {
            return res.status(403).json({ message: "Acceso denegado" });
        }

        let query = `
            SELECT c.*, m.nombre as empresa_nombre 
            FROM CLIENTE c 
            LEFT JOIN MICROEMPRESA m ON c.microempresa_id = m.id_microempresa 
            WHERE c.estado = 'activo'
        `;
        let params = [];

        if (search) {
            query += ` AND (c.nombre_razon_social LIKE ? OR c.email LIKE ? OR c.ci_nit LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        if (microempresa_id) {
            query += ` AND c.microempresa_id = ?`;
            params.push(microempresa_id);
        }

        if (origen) {
            query += ` AND c.origen = ?`;
            params.push(origen);
        }

        query += ` ORDER BY c.fecha_registro DESC`;

        const [rows] = await db.execute(query, params);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// 8. REACTIVAR CLIENTE ELIMINADO
exports.reactivarCliente = async (req, res) => {
    const { id } = req.params;
    const { rol } = req.user;

    try {
        if (rol !== 'super_admin') {
            return res.status(403).json({ message: "Solo el Super Admin puede reactivar clientes" });
        }

        const [result] = await db.execute(
            'UPDATE CLIENTE SET estado = "activo" WHERE id_cliente = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Cliente no encontrado" });
        }

        res.json({ message: "Cliente reactivado exitosamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};