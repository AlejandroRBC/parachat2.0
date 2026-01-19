import api from './api';

export const superAdminService = {
    // Clientes
    getClientesCompleto: (params) => 
        api.get('/super-admin/clientes', { params }),
    
    // Estadísticas
    getEstadisticas: () => 
        api.get('/super-admin/estadisticas'),
    
    // Microempresas
    getMicroempresasCompleto: () => 
        api.get('/super-admin/microempresas-completo'),
    
    // Planes
    getPlanesCompleto: () => 
        api.get('/super-admin/planes-completo'),
    
    // Acciones
    cambiarEstadoCliente: (id, estado) => 
        api.put(`/clientes/${id}/estado`, { estado }),
    
    cambiarEstadoUsuario: (id, estado) => 
        api.put(`/usuarios/estado/${id}`, { estado }),
    
    cambiarEstadoEmpresa: (id, estado) => 
        api.put(`/microempresas/${id}/estado`, { estado }),
    
    // Exportar datos
    exportarDatos: (tipo, formato = 'csv') => 
        api.get(`/super-admin/export/${tipo}?formato=${formato}`, {
            responseType: 'blob'
        })
};