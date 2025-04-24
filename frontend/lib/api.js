import axios from 'axios';

// API temel URL'ini ayarla - Sabit değerler kullan
const DEVELOPMENT_API_URL = 'http://localhost:5050';
const PRODUCTION_API_URL = 'https://api.depositshield.retako.com';

// Çalışma ortamına göre URL belirle
const isProduction = typeof window !== 'undefined' 
  ? window.location.hostname !== 'localhost' 
  : process.env.NODE_ENV === 'production';

const API_URL = isProduction ? PRODUCTION_API_URL : DEVELOPMENT_API_URL;

// Debug modunda hangi API URL'sini kullandığımızı göster
console.log('🌐 Environment:', isProduction ? 'PRODUCTION' : 'DEVELOPMENT');
console.log('🔌 API Base URL:', API_URL);

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
      // Sadece paylasılan rapor sayfalarında olmadıgımıza emin olalim
      if (!window.location.pathname.includes('/reports/shared/')) {
        window.location.href = '/login';
      }
    }
    console.error('API Error:', error.response ? error.response.data : error.message);
    return Promise.reject(error);
  }
);

// Public endpoints without token - burası garantili anonim erişim için (UUID bazlı paylaşılan kaynaklar)
const publicApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-Public-Access': 'true' // Anonim erişim için özel header
  },
  timeout: 8000, // 8 saniye timeout (API yanıt vermezse)
});

// Bu API isteği asla kimlik doğrulama bilgilerini içermez ve 401 hatası vermez
publicApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Public API error:', error.message || error);
    // Yanıt olmayan bir hata varsa (ağ hatası veya CORS), boş bir veri döndürelim
    if (!error.response) {
      console.warn('Network error on public API, returning empty data');
      // URL'yi kontrol et, /reports/uuid/ için boş bir rapor nesnesi, diğer durumlarda boş dizi döndür
      const url = error.config?.url || '';
      if (url.includes('/reports/uuid/')) {
        const uuid = url.split('/').pop();
        return Promise.resolve({ 
          data: { 
            id: uuid || 'unknown', 
            title: 'Shared Report', 
            description: 'This report could not be loaded due to connection issues.', 
            address: 'Not available', 
            type: 'general',
            created_at: new Date().toISOString(),
            creator_name: 'Not available',
            error: true,
            dummy: true 
          } 
        });
      }
      return Promise.resolve({ data: error.config?.url.includes('photos') ? [] : {} });
    }
    // HTTP hata kodu 401, 403, 404, 500, vb.
    if (error.response) {
      console.warn(`HTTP error ${error.response.status} on public API, returning default data`);
      // URL'yi kontrol et, /reports/uuid/ için boş bir rapor nesnesi, diğer durumlarda boş dizi döndür
      const url = error.config?.url || '';
      if (url.includes('/reports/uuid/')) {
        const uuid = url.split('/').pop();
        return Promise.resolve({ 
          data: { 
            id: uuid || 'unknown', 
            title: 'Shared Report (Error)', 
            description: `This report could not be loaded. Error: ${error.response.status}`, 
            address: 'Not available', 
            type: 'general',
            created_at: new Date().toISOString(),
            creator_name: 'Not available',
            error: true,
            dummy: true 
          } 
        });
      }
      return Promise.resolve({ data: url.includes('photos') ? [] : {} });
    }
    return Promise.reject(error);
  }
);

// Token varsa kullanan ama yoksa sessizce geçen API (giriş yapanlar ve yapmayanlar)
const publicTokenApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-Optional-Auth': 'true' // İsteğe bağlı kimlik doğrulama için özel header
  },
});

// Bu interceptor token varsa ekler, yoksa sessizce devam eder
publicTokenApi.interceptors.request.use(
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

// Herhangi bir 401 hatasında sessizce geç (istek tamamen boşa düşmek yerine boş veri döndür)
publicTokenApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 401 hatası olursa (kimlik doğrulama başarısız olduğunda)
    if (error.response && error.response.status === 401) {
      console.warn('Auth failed on publicTokenApi, proceeding as anonymous user');
      // İsteğin türüne göre uygun boş veri formatı döndür
      const url = error.config.url || '';
      if (url.includes('photos') || url.includes('reports')) {
        return Promise.resolve({ data: [] }); // Liste isteği
      } else {
        return Promise.resolve({ data: {} }); // Tek kaynak isteği
      }
    }
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
    // Test mail endpoint (doğrudan e-posta gönderimini test etmek için)
    testMail: (data) => {
      console.log('📧 TEST EMAIL API CALL:', data);
      return axios.post(`${API_URL}/api/reports/test-mail`, data, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
    },
    
    // Rapor arşivleme
    archive: (id, data) => {
      console.log(`📁 REPORT ARCHIVE API CALL: ID=${id}`);
      return api.put(`/api/reports/${id}/archive`, data);
    },
    getAll: () => api.get('/api/reports'),
    getByProperty: (propertyId) => api.get(`/api/reports/property/${propertyId}`),
    getById: (id) => api.get(`/api/reports/${id}`),
    getByUuid: (uuid) => {
      // Normal API call - bu endpoint kimlik doğrulama gerektirmez (public endpoint)
      console.log(`Getting report by UUID using ${API_URL}`);
      return axios.get(`${API_URL}/api/reports/uuid/${uuid}`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }).then(response => {
        console.log('API response data:', response.data);
        
        // Validate approval_status format - ensure it's either 'approved', 'rejected', or null
        // This is important for new reports that might have undefined or invalid values
        if (!response.data.approval_status || 
            (response.data.approval_status !== 'approved' && 
             response.data.approval_status !== 'rejected')) {
          console.log('Setting approval_status to null (was:', response.data.approval_status, ')');
          response.data.approval_status = null;
        }
        
        console.log('Final approval_status:', response.data.approval_status);
        return response;
      }).catch(error => {
        // Eğer API hatası alınırsa, fallback data dön
        console.warn('Error fetching report by UUID:', error.message || error);
        console.error('API Error details:', error.response ? error.response.data : 'No response data');
        
        // Eğer veritabanı schema hatası varsa (ER_BAD_FIELD_ERROR)
        if (error.response && error.response.data && 
            (error.response.data.code === 'ER_BAD_FIELD_ERROR' || 
             (error.response.data.message && error.response.data.message.includes('Unknown column')))) {
          console.warn('Database schema error detected, trying alternative endpoint');
          
          // Alternatif endpoint denemesi
          return axios.get(`${API_URL}/api/reports/${uuid.replace(/[^a-zA-Z0-9-]/g, '')}`, {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
            }
          }).catch(altError => {
            console.error('Alternative endpoint also failed:', altError.message || altError);
            // Fallback dummy rapor döndür
            const dummyReport = {
              id: uuid,
              title: 'Shared Report', 
              description: 'This report could not be loaded. There might be a database schema mismatch.',
              address: 'Not available',
              type: 'general',
              created_at: new Date().toISOString(),
              creator_name: 'Not available',
              tenant_name: 'Demo Tenant',
              tenant_email: 'tenant@example.com',
              is_archived: false, // Eksik kolon için varsayılan değer
              approval_status: null, // Varsayılan onay durumu
              dummy: true
            };
            return { data: dummyReport };
          });
        }
        
        // Normal hata durumu için dummy rapor
        const dummyReport = {
          id: uuid,
          title: 'Shared Report', 
          description: 'This report could not be loaded. The server might be temporarily unavailable.',
          address: 'Not available',
          type: 'general',
          created_at: new Date().toISOString(),
          creator_name: 'Not available',
          tenant_name: 'Demo Tenant',
          tenant_email: 'tenant@example.com',
          is_archived: false, // Eksik kolon için varsayılan değer
          approval_status: null, // Varsayılan onay durumu
          dummy: true
        };
        
        return { data: dummyReport };
      });
    },
    
    create: (data) => api.post('/api/reports', data),
    update: (id, data) => api.put(`/api/reports/${id}`, data),
    delete: (id) => api.delete(`/api/reports/${id}`),
    
    // UUID varsa herkese açık API'yi kullan, değilse normal API kullan
    approve: (id, data) => {
      console.log(`🔴 REPORT APPROVE API CALL: ID=${id}, UUID=${data.uuid || 'N/A'}`);
      console.log('Approve payload:', data);
      
      if (data && data.uuid) {
        // PUBLIC ENDPOINT KULLAN - Auth gerektirmeyen
        return axios.put(`${API_URL}/api/reports/${id}/public-approve`, { ...data, isPublic: true })
          .then(response => {
            console.log('Approve API response:', response.data);
            return response;
          })
          .catch(error => {
            console.error('Approve API Error:', {
              message: error.message,
              status: error.response?.status,
              data: error.response?.data
            });
            // Simule etmek yerine gerçek hatayı fırlat ki frontend sorunu algılayabilsin
            throw error;
          });
      }
      return api.put(`/api/reports/${id}/approve`, data);
    },
    
    reject: (id, data) => {
      console.log(`🔴 REPORT REJECT API CALL: ID=${id}, UUID=${data.uuid || 'N/A'}`);
      console.log('Reject payload:', data);
      
      if (data && data.uuid) {
        // PUBLIC ENDPOINT KULLAN - Auth gerektirmeyen
        return axios.put(`${API_URL}/api/reports/${id}/public-reject`, { ...data, isPublic: true })
          .then(response => {
            console.log('Reject API response:', response.data);
            return response;
          })
          .catch(error => {
            console.error('Reject API Error:', {
              message: error.message,
              status: error.response?.status,
              data: error.response?.data
            });
            // Simule etmek yerine gerçek hatayı fırlat ki frontend sorunu algılayabilsin
            throw error;
          });
      }
      return api.put(`/api/reports/${id}/reject`, data);
    },
    
    sendNotification: (id, data) => {
      console.log(`🔴 REPORT NOTIFY API CALL: ID=${id}, UUID=${data.reportUuid || 'N/A'}`);
      console.log('Notification payload:', {
        recipientEmail: data.recipientEmail,
        subject: data.subject,
        status: data.status
      });
      
      if (data && data.reportUuid) {
        // PUBLIC ENDPOINT KULLAN - Auth gerektirmeyen
        return axios.post(`${API_URL}/api/reports/${id}/public-notify`, { ...data, isPublic: true })
          .then(response => {
            console.log('Notification API response:', response.data);
            return response;
          })
          .catch(error => {
            console.error('Notification API Error:', {
              message: error.message,
              status: error.response?.status,
              data: error.response?.data
            });
            // Simule etmek yerine gerçek hatayı fırlat ki frontend sorunu algılayabilsin
            throw error;
          });
      }
      return api.post(`/api/reports/${id}/notify`, data);
    },
  },
  
  // Fotoğraf işlemleri
  photos: {
    getAll: () => api.get('/api/photos'),
    getById: (id) => api.get(`/api/photos/${id}`),
    getByReport: (reportId) => {
      console.log(`Getting photos for report ${reportId} using ${API_URL}`);
      // Önce kimlik doğrulama olmadan public endpoint'i dene
      return axios.get(`${API_URL}/api/photos/public-report/${reportId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }).catch(error => {
        console.warn(`Public photos endpoint failed, trying alternative endpoint: ${error.message || error}`);
        // Public endpoint başarısız olursa normal endpoint'i dene
        return axios.get(`${API_URL}/api/photos/report/${reportId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          }
        }).catch(fallbackError => {
          console.error(`All photo endpoints failed for report ${reportId}:`, fallbackError.message || fallbackError);
          return { data: [] };
        });
      });
    },
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
    checkToken: () => api.get('/api/auth/token-check'),
  }
};

export default api;