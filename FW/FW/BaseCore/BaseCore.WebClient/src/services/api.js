import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth API
export const authApi = {
    login: (username, password) => api.post('/auth/login', { username, password }),
    register: (data) => api.post('/auth/register', data),
};

// User API
export const userApi = {
    getAll: (params) => api.get('/users', { params }),
    getById: (id) => api.get(`/users/${id}`),
    create: (data) => api.post('/users', data),
    update: (id, data) => api.put(`/users/${id}`, data),
    delete: (id) => api.delete(`/users/${id}`),
};

// Product API
export const productApi = {
    getAll: (params) => api.get('/products', { params }),
    search: (params) => api.get('/products/search', { params }), // ✅ ĐÃ SỬA: gọi đúng endpoint
    getById: (id) => api.get(`/products/${id}`),
    create: (data) => api.post('/products', data),
    update: (id, data) => api.put(`/products/${id}`, data),
    delete: (id) => api.delete(`/products/${id}`),
};

// Category API
export const categoryApi = {
    getAll: () => api.get('/categories'),
    getById: (id) => api.get(`/categories/${id}`),
    create: (data) => api.post('/categories', data),
    update: (id, data) => api.put(`/categories/${id}`, data),
    delete: (id) => api.delete(`/categories/${id}`),
};

// Order API
export const orderApi = {
    create: (data) => api.post('/orders', data),
    getMyOrders: () => api.get('/orders'),
    getById: (id) => api.get(`/orders/${id}`),
    getAll: () => api.get('/orders/all'),
    getAdminOrders: (status) => api.get(`/orders/admin/orders${status ? `?status=${status}` : ''}`),
    confirm: (id) => api.put(`/orders/${id}/confirm`),
    deliver: (id) => api.put(`/orders/${id}/deliver`),
    cancel: (id) => api.put(`/orders/${id}/cancel`),
};

// Cart API
export const cartApi = {
    getCart: () => api.get('/cart'),
    addToCart: (data) => api.post('/cart/add', data),
    updateQuantity: (productId, quantity) => api.put('/cart/update', { productId, quantity }),
    removeFromCart: (productId) => api.delete(`/cart/remove/${productId}`),
    clearCart: () => api.delete('/cart/clear'),
    buyNow: (data) => api.post('/cart/buy-now', data),
    checkout: (data) => api.post('/cart/checkout', data),
};

export default api;