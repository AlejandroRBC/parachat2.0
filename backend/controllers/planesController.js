const db = require('../config/db');

// OBTENER TODOS LOS PLANES
exports.getPlanes = async (req, res) => {
    try {
        const query = `
            SELECT 
                p.*,
                COUNT(DISTINCT m.id_microempresa) as empresas_count,
                COUNT(DISTINCT CASE WHEN m.estado = 'activa' THEN m.id_microempresa END) as empresas_activas
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

// CREAR NUEVO PLAN
exports.createPlan = async (req, res) => {
    const { nombre_plan, descripcion, precio, tipo_plan, limite_usuarios, limite_productos, estado } = req.body;
    
    try {
        await db.execute(
            `INSERT INTO PLAN_PAGO 
            (nombre_plan, descripcion, precio, tipo_plan, limite_usuarios, limite_productos, estado) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [nombre_plan, descripcion, precio, tipo_plan, limite_usuarios, limite_productos, estado || 'activo']
        );
        
        res.status(201).json({ message: "Plan creado exitosamente" });
        
    } catch (error) {
        console.error('Error creando plan:', error);
        res.status(500).json({ error: error.message });
    }
};

// ACTUALIZAR PLAN
exports.updatePlan = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    
    try {
        const allowedFields = ['nombre_plan', 'descripcion', 'precio', 'tipo_plan', 'limite_usuarios', 'limite_productos', 'estado'];
        const fieldsToUpdate = {};
        
        // Filtrar solo los campos permitidos
        allowedFields.forEach(field => {
            if (updates[field] !== undefined) {
                fieldsToUpdate[field] = updates[field];
            }
        });
        
        if (Object.keys(fieldsToUpdate).length === 0) {
            return res.status(400).json({ message: "No hay campos para actualizar" });
        }
        
        const setClause = Object.keys(fieldsToUpdate).map(field => `${field} = ?`).join(', ');
        const values = [...Object.values(fieldsToUpdate), id];
        
        const [result] = await db.execute(
            `UPDATE PLAN_PAGO SET ${setClause} WHERE id_plan = ?`,
            values
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Plan no encontrado" });
        }
        
        res.json({ message: "Plan actualizado exitosamente" });
        
    } catch (error) {
        console.error('Error actualizando plan:', error);
        res.status(500).json({ error: error.message });
    }
};

// ELIMINAR PLAN (cambio de estado)
exports.deletePlan = async (req, res) => {
    const { id } = req.params;
    
    try {
        const [result] = await db.execute(
            'UPDATE PLAN_PAGO SET estado = "inactivo" WHERE id_plan = ?',
            [id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Plan no encontrado" });
        }
        
        res.json({ message: "Plan desactivado exitosamente" });
        
    } catch (error) {
        console.error('Error eliminando plan:', error);
        res.status(500).json({ error: error.message });
    }
};

// OBTENER ESTADÍSTICAS DE PLANES
exports.getEstadisticasPlanes = async (req, res) => {
    try {
        const queries = [
            // Distribución de empresas por plan
            `SELECT 
                p.nombre_plan,
                COUNT(m.id_microempresa) as total_empresas,
                SUM(CASE WHEN m.estado = 'activa' THEN 1 ELSE 0 END) as empresas_activas,
                SUM(CASE WHEN m.estado = 'inactiva' THEN 1 ELSE 0 END) as empresas_inactivas
            FROM PLAN_PAGO p
            LEFT JOIN MICROEMPRESA m ON p.id_plan = m.plan_id
            GROUP BY p.id_plan
            ORDER BY total_empresas DESC`,
            
            // Ingresos estimados por plan
            `SELECT 
                p.nombre_plan,
                p.precio,
                COUNT(m.id_microempresa) as total_empresas,
                (p.precio * COUNT(m.id_microempresa)) as ingresos_mensuales_estimados
            FROM PLAN_PAGO p
            LEFT JOIN MICROEMPRESA m ON p.id_plan = m.plan_id AND m.estado = 'activa'
            GROUP BY p.id_plan`
        ];
        
        const resultados = await Promise.all(
            queries.map(q => db.execute(q).then(([rows]) => rows))
        );
        
        res.json({
            distribucion: resultados[0],
            ingresos: resultados[1]
        });
        
    } catch (error) {
        console.error('Error obteniendo estadísticas de planes:', error);
        res.status(500).json({ error: error.message });
    }
};