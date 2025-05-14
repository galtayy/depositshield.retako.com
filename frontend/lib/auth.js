import { createContext, useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import { jwtDecode } from 'jwt-decode';
import api, { apiService } from './api';

const AuthContext = createContext({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  verifyEmail: async () => {},
  resendVerificationCode: async () => {},
  logout: () => {},
  checkAuth: () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingVerification, setPendingVerification] = useState(false);
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
        
        // Eğer doğrulama bekleniyorsa flag'i ayarla
        if (decoded.user.needsVerification) {
          setPendingVerification(true);
        } else {
          setPendingVerification(false);
        }
        
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
      
      // Doğrulama gerekiyorsa
      if (response.data.tempToken && response.data.user.needsVerification) {
        localStorage.setItem('tempToken', response.data.tempToken);
        const decoded = jwtDecode(response.data.tempToken);
        setUser(decoded.user);
        setPendingVerification(true);
        setLoading(false);
        return { 
          success: false, 
          needsVerification: true,
          userId: decoded.user.id,
          message: response.data.message
        };
      }
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        
        const decoded = jwtDecode(response.data.token);
        setUser(decoded.user);
        setPendingVerification(false);
        setLoading(false);
        
        // Login sonrası router navigation
        if (typeof window !== 'undefined') {
          setTimeout(() => {
            // Do not automatically redirect here - let the verification success page handle it
          }, 100);
        }
        
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
      
      // Eğer doğrulama gerekiyorsa
      if (response.data.tempToken && response.data.user.needsVerification) {
        localStorage.setItem('tempToken', response.data.tempToken);
        const decoded = jwtDecode(response.data.tempToken);
        setUser(decoded.user);
        setPendingVerification(true);
        setLoading(false);
        return { 
          success: false, 
          needsVerification: true,
          userId: decoded.user.id,
          message: response.data.message
        };
      }
      
      // Normal kayıt (doğrulama gerekmeyen durumlar için)
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        
        const decoded = jwtDecode(response.data.token);
        setUser(decoded.user);
        setPendingVerification(false);
        setLoading(false);
        
        // Login sonrası router navigation
        if (typeof window !== 'undefined') {
          setTimeout(() => {
            // Do not automatically redirect here - let the verification success page handle it
          }, 100);
        }
        
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

  // Email doğrulama işlemi
  const verifyEmail = async (userId, code) => {
    try {
      setLoading(true);
      console.log('Calling API with:', { userId, code });
      
      const response = await apiService.auth.verifyEmail({ userId, code });
      console.log('Verification API response:', response.data);
      
      if (response.data.token) {
        localStorage.removeItem('tempToken');
        localStorage.setItem('token', response.data.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        
        const decoded = jwtDecode(response.data.token);
        setUser(decoded.user);
        setPendingVerification(false);
        setLoading(false);
        
        // Doğrulama sonrası router navigation
        if (typeof window !== 'undefined') {
          // Verification sayfasında yönlendirmeyi verification-success sayfasına bırakıyoruz
          // Verification-success sayfası properties'e yönlendirecek
        }
        
        return { 
          success: true,
          message: response.data.message || 'Email verified successfully'
        };
      }
      
      // If response exists but no token was provided
      if (response.data) {
        return {
          success: !!response.data.success,
          message: response.data.message || 'Unknown response'
        };
      }
      
      return { success: false, message: 'Invalid response from server' };
    } catch (error) {
      console.error('Email verification error:', error);
      setLoading(false);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Doğrulama yapılırken bir hata oluştu'
      };
    }
  };

  // Çıkış işlemi
  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('tempToken');
      delete api.defaults.headers.common['Authorization'];
    }
    setUser(null);
    setPendingVerification(false);
    router.push('/login');
  };

  // Resend verification code
  const resendVerificationCode = async (userId) => {
    try {
      setLoading(true);
      const response = await apiService.auth.resendVerificationCode({ userId });
      setLoading(false);
      
      if (response.data.success) {
        return { 
          success: true,
          message: response.data.message
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to resend verification code'
        };
      }
    } catch (error) {
      console.error('Resend verification code error:', error);
      setLoading(false);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to resend verification code'
      };
    }
  };

  const value = {
    user,
    loading,
    pendingVerification,
    login,
    register,
    verifyEmail,
    resendVerificationCode,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
