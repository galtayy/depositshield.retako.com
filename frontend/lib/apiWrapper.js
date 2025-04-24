import api, { apiService } from './api';

// Universal API wrapper for monitoring all API calls
const monitoredApiService = {};

// Helper for debugging API calls
const logApiCall = async (name, promiseFn) => {
  console.log(`🔄 API CALL (${name}): Starting...`);
  try {
    const startTime = performance.now();
    const result = await promiseFn();
    const endTime = performance.now();
    console.log(`✅ API CALL (${name}): Success in ${(endTime - startTime).toFixed(2)}ms`);
    // Verileri sadece geliştirme ortamında günlüğe kaydet, canlı ortamda değil
    const isProduction = typeof window !== 'undefined' ? window.location.hostname !== 'localhost' : process.env.NODE_ENV === 'production';
    if (!isProduction) {
      console.log('📦 Response data:', result.data);
    }
    return result;
  } catch (error) {
    console.error(`❌ API CALL (${name}): Failed`);
    console.error('🚨 Error details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL,
        headers: error.config?.headers,
      }
    });
    throw error;
  }
};

// Recursively wrap all API service methods
const wrapApiServiceMethods = (source, target, prefix = '') => {
  Object.keys(source).forEach(key => {
    const fullPath = prefix ? `${prefix}.${key}` : key;
    
    if (typeof source[key] === 'function') {
      target[key] = (...args) => logApiCall(fullPath, () => source[key](...args));
    } else if (typeof source[key] === 'object' && source[key] !== null) {
      target[key] = {};
      wrapApiServiceMethods(source[key], target[key], fullPath);
    } else {
      target[key] = source[key];
    }
  });
};

// Create a monitored version of apiService
wrapApiServiceMethods(apiService, monitoredApiService);

export { monitoredApiService as apiService };
export default api;
