import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request if present
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redirect to login on 401
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return Promise.reject(err);
  }
);

// ── Product APIs ──────────────────────────────────────────────────
export const productAPI = {
  getAll: (category = 'all') => API.get(`/api/products?category=${category}`),
  getById: (id) => API.get(`/api/products/${id}`),
  create: (data) => API.post('/api/products', data),
  update: (id, data) => API.put(`/api/products/${id}`, data),
  delete: (id) => API.delete(`/api/products/${id}`),
  init: () => API.get('/api/products/init'),
};

// ── Order APIs ────────────────────────────────────────────────────
export const orderAPI = {
  place: (data) => API.post('/api/orders', data),
  getAll: () => API.get('/api/orders'),
  getById: (orderId) => API.get(`/api/orders/${orderId}`),
};

// ── Auth APIs ─────────────────────────────────────────────────────
export const authAPI = {
  login: (data) => API.post('/api/auth/login', data),
  register: (data) => API.post('/api/auth/register', data),
};

// ── Payment APIs ──────────────────────────────────────────────────
export const paymentAPI = {
  createOrder: (data) => API.post('/api/payment/create-order', data),
};

export default API;
