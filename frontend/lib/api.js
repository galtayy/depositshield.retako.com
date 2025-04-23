import axios from 'axios';

// API temel URL'ini ayarla
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050';

// Axios instance oluştur
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Token varsa ekle
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 401 Unauthorized hatası varsa token'ı sil ve login sayfasına yönlendir
    if (error.response && error.response.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    console.error('API Error:', error.response ? error.response.data : error.message);
    return Promise.reject(error);
  }
);

// API fonksiyonları
export const apiService = {
  // Mülk işlemleri
  properties: {
    getAll: () => api.get('/api/properties'),
    getById: (id) => api.get(`/api/properties/${id}`),
    create: (data) => api.post('/api/properties', data),
    update: (id, data) => api.put(`/api/properties/${id}`, data),
    delete: (id) => api.delete(`/api/properties/${id}`),
  },
  
  // Rapor işlemleri
  reports: {
    getAll: () => api.get('/api/reports'),
    getByProperty: (propertyId) => api.get(`/api/reports/property/${propertyId}`),
    getById: (id) => api.get(`/api/reports/${id}`),
    getByUuid: (uuid) => api.get(`/api/reports/uuid/${uuid}`),
    create: (data) => api.post('/api/reports', data),
    update: (id, data) => api.put(`/api/reports/${id}`, data),
    delete: (id) => api.delete(`/api/reports/${id}`),
  },
  
  // Fotoğraf işlemleri
  photos: {
    getAll: () => api.get('/api/photos'),
    getById: (id) => api.get(`/api/photos/${id}`),
    getByReport: (reportId) => api.get(`/api/photos/report/${reportId}`),
    upload: (reportId, formData) => {
      return api.post(`/api/photos/upload/${reportId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
    updateNote: (id, note) => api.put(`/api/photos/${id}/note`, { note }),
    addTag: (id, tag) => api.post(`/api/photos/${id}/tags`, { tag }),
    removeTag: (id, tag) => api.delete(`/api/photos/${id}/tags/${tag}`),
    delete: (id) => api.delete(`/api/photos/${id}`),
  },

  // Kullanıcı işlemleri
  user: {
    getProfile: () => api.get('/api/users/profile'),
    updateProfile: (data) => api.put('/api/users/profile', data),
    changePassword: (data) => api.put('/api/users/password', data),
  },
  
  // Auth işlemleri
  auth: {
    login: (credentials) => api.post('/api/auth/login', credentials),
    register: (userData) => api.post('/api/auth/register', userData),
    getUser: () => api.get('/api/auth/user'),
  }
};

export default api;
