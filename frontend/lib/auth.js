import { createContext, useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import { jwtDecode } from 'jwt-decode';
import api, { apiService } from './api';

const AuthContext = createContext({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  checkAuth: () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Auth durumunu kontrol et
  useEffect(() => {
    checkAuth();
  }, []);

  // Token'ı kontrol et ve decode et
  const checkAuth = () => {
    if (typeof window === 'undefined') {
      setLoading(false);
      return false;
    }
    
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        
        if (decoded.exp < currentTime) {
          // Token süresi dolmuşsa
          logout();
          return false;
        }
        
        // Token geçerliyse kullanıcı bilgilerini ayarla
        setUser(decoded.user);
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setLoading(false);
        return true;
      } catch (error) {
        console.error('Token decode hatası:', error);
        logout();
        return false;
      }
    } else {
      setLoading(false);
      return false;
    }
  };

  // Giriş işlemi
  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await apiService.auth.login({ email, password });
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        
        const decoded = jwtDecode(response.data.token);
        setUser(decoded.user);
        setLoading(false);
        return { success: true };
      }
    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Giriş yapılırken bir hata oluştu'
      };
    }
  };

  // Kayıt işlemi
  const register = async (name, email, password) => {
    try {
      setLoading(true);
      const response = await apiService.auth.register({ 
        name, 
        email, 
        password 
      });
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        
        const decoded = jwtDecode(response.data.token);
        setUser(decoded.user);
        setLoading(false);
        return { success: true };
      }
    } catch (error) {
      console.error('Register error:', error);
      setLoading(false);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Kayıt olurken bir hata oluştu'
      };
    }
  };

  // Çıkış işlemi
  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
    }
    setUser(null);
    router.push('/login');
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
