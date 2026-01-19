const db = require('../config/db');

// OBTENER TODOS LOS CLIENTES CON FILTROS
exports.getClientesCompleto = async (req, res) => {
    const { search, empresa_id, estado, origen, page = 1, limit = 1000 } = req.query;
    
    try {
        let query = `
            SELECT 
                c.*,
                m.nombre as empresa_nombre,
                m.telefono as empresa_telefono
            FROM CLIENTE c
            LEFT JOIN MICROEMPRESA m ON c.microempresa_id = m.id_microempresa
            WHERE 1=1
        `;
        
        let params = [];
        
        if (search) {
            query += ` AND (
                c.nombre_razon_social LIKE ? OR 
                c.email LIKE ? OR 
                c.ci_nit LIKE ? OR 
                c.telefono LIKE ?
            )`;
            params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
        }
        
        if (empresa_id) {
            query += ` AND c.microempresa_id = ?`;
            params.push(empresa_id);
        }
        
        if (estado) {
            query += ` AND c.estado = ?`;
            params.push(estado);
        }
        
        if (origen) {
            query += ` AND c.origen = ?`;
            params.push(origen);
        }
        
        query += ` ORDER BY c.fecha_registro DESC`;
        
        // Para paginación
        if (page && limit) {
            const offset = (page - 1) * limit;
            query += ` LIMIT ? OFFSET ?`;
            params.push(parseInt(limit), offset);
        }
        
        const [rows] = await db.execute(query, params);
        
        // Contar total
        const countQuery = query.replace('SELECT c.*, m.nombre as empresa_nombre', 'SELECT COUNT(*) as total');
        const [countResult] = await db.execute(countQuery.split('ORDER BY')[0].split('LIMIT')[0], params.slice(0, -2));
        
        res.json({
            data: rows,
            total: countResult[0]?.total || 0,
            page: parseInt(page),
            limit: parseInt(limit)
        });
        
    } catch (error) {
        console.error('Error obteniendo clientes:', error);
        res.status(500).json({ error: error.message });
    }
};

// OBTENER ESTADÍSTICAS DEL SISTEMA
exports.getEstadisticas = async (req, res) => {
    try {
        const queries = [
            // Total clientes
            `SELECT COUNT(*) as total, 
                    SUM(CASE WHEN estado = 'activo' THEN 1 ELSE 0 END) as activos 
             FROM CLIENTE`,
            
            // Total usuarios
            `SELECT COUNT(*) as total, 
                    SUM(CASE WHEN estado = 'activo' THEN 1 ELSE 0 END) as activos 
             FROM USUARIO`,
            
            // Total microempresas
            `SELECT COUNT(*) as total, 
                    SUM(CASE WHEN estado = 'activa' THEN 1 ELSE 0 END) as activas 
             FROM MICROEMPRESA`,
            
            // Total planes
            `SELECT COUNT(*) as total, 
                    SUM(CASE WHEN estado = 'suscrito' THEN 1 ELSE 0 END) as suscritos 
             FROM PLAN_PAGO`,
            
            // Clientes por origen
            `SELECT origen, COUNT(*) as cantidad 
             FROM CLIENTE 
             GROUP BY origen`,
            
            // Usuarios por rol
            `SELECT r.tipo_rol, COUNT(*) as cantidad 
             FROM USUARIO u 
             JOIN ROL r ON u.rol_id = r.id_rol 
             GROUP BY r.tipo_rol`,
            
            // Empresas por plan
            `SELECT p.nombre_plan, COUNT(*) as cantidad 
             FROM MICROEMPRESA m 
             LEFT JOIN PLAN_PAGO p ON m.plan_id = p.id_plan 
             GROUP BY p.nombre_plan`
        ];
        
        const resultados = await Promise.all(
            queries.map(q => db.execute(q).then(([rows]) => rows))
        );
        
        res.json({
            clientes: resultados[0][0],
            usuarios: resultados[1][0],
            microempresas: resultados[2][0],
            planes: resultados[3][0],
            clientesPorOrigen: resultados[4],
            usuariosPorRol: resultados[5],
            empresasPorPlan: resultados[6]
        });
        
    } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        res.status(500).json({ error: error.message });
    }
};

// OBTENER TODAS LAS MICROEMPRESAS CON DETALLES
exports.getMicroempresasCompleto = async (req, res) => {
    try {
        const query = `
            SELECT 
                m.*,
                p.nombre_plan,
                p.precio,
                COUNT(DISTINCT u.id_usuario) as usuarios_count,
                COUNT(DISTINCT c.id_cliente) as clientes_count
            FROM MICROEMPRESA m
            LEFT JOIN PLAN_PAGO p ON m.plan_id = p.id_plan
            LEFT JOIN USUARIO u ON m.id_microempresa = u.microempresa_id
            LEFT JOIN CLIENTE c ON m.id_microempresa = c.microempresa_id
            GROUP BY m.id_microempresa
            ORDER BY m.fecha_registro DESC
        `;
        
        const [rows] = await db.execute(query);
        res.json(rows);
        
    } catch (error) {
        console.error('Error obteniendo microempresas:', error);
        res.status(500).json({ error: error.message });
    }
};

// OBTENER TODOS LOS PLANES CON ESTADÍSTICAS
exports.getPlanesCompleto = async (req, res) => {
    try {
        const query = `
            SELECT 
                p.*,
                COUNT(DISTINCT m.id_microempresa) as empresas_count,
                SUM(CASE WHEN m.estado = 'activa' THEN 1 ELSE 0 END) as empresas_activas
            FROM PLAN_PAGO p
            LEFT JOIN MICROEMPRESA m ON p.id_plan = m.plan_id
            GROUP BY p.id_plan
            ORDER BY p.precio
        `;
        
        const [rows] = await db.execute(query);
        res.json(rows);
        
    } catch (error) {
        console.error('Error obteniendo planes:', error);
        res.status(500).json({ error: error.message });
    }
};