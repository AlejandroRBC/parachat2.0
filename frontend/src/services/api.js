import axios from 'axios';

// IMPORTANTE: Cambiar a localhost:3000
const API_URL = 'http://localhost:3000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor para agregar token
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;

// Servicios específicos
export const usuarioService = {
    getAll: () => api.get('/usuarios'),
    create: (data) => api.post('/usuarios', data),
    updateEstado: (id, estado) => api.put(`/usuarios/${id}/estado`, { estado })
};