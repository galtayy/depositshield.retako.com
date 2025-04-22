import axios from 'axios';

// API temel URL'ini ayarla
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://apidepositshield.retako.com/api';

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
    getAll: () => api.get('/properties'),
    getById: (id) => api.get(`/properties/${id}`),
    create: (data) => api.post('/properties', data),
    update: (id, data) => api.put(`/properties/${id}`, data),
    delete: (id) => api.delete(`/properties/${id}`),
  },
  
  // Rapor işlemleri
  reports: {
    getAll: () => api.get('/reports'),
    getByProperty: (propertyId) => api.get(`/reports/property/${propertyId}`),
    getById: (id) => api.get(`/reports/${id}`),
    getByUuid: (uuid) => api.get(`/reports/uuid/${uuid}`),
    create: (data) => api.post('/reports', data),
    update: (id, data) => api.put(`/reports/${id}`, data),
    delete: (id) => api.delete(`/reports/${id}`),
  },
  
  // Fotoğraf işlemleri
  photos: {
    getAll: () => api.get('/photos'),
    getById: (id) => api.get(`/photos/${id}`),
    getByReport: (reportId) => api.get(`/photos/report/${reportId}`),
    upload: (reportId, formData) => {
      return api.post(`/photos/upload/${reportId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    },
    updateNote: (id, note) => api.put(`/photos/${id}/note`, { note }),
    addTag: (id, tag) => api.post(`/photos/${id}/tags`, { tag }),
    removeTag: (id, tag) => api.delete(`/photos/${id}/tags/${tag}`),
    delete: (id) => api.delete(`/photos/${id}`),
  },

  // Kullanıcı işlemleri
  user: {
    getProfile: () => api.get('/users/profile'),
    updateProfile: (data) => api.put('/users/profile', data),
    changePassword: (data) => api.put('/users/password', data),
  },
  
  // Auth işlemleri
  auth: {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    getUser: () => api.get('/auth/user'),
  }
};

export default api;
