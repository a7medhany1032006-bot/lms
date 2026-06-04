import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('تم تسجيل الخروج بنجاح');
  };

  // ── Session Persistence ───────────────────────────────────────────────────────
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        setUser(response.data.data);
      } catch (error) {
        console.error('Session restore failed. Invalid or expired token.');
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  // ── Auth Actions ─────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      const { token, user: userData } = response.data.data;
      localStorage.setItem('token', token);
      setUser(userData);
      
      return { success: true, role: userData.role };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'فشل تسجيل الدخول. يرجى المحاولة لاحقاً.';
      return { success: false, message: errorMessage };
    }
  };

  const register = async (full_name, email, password) => {
    try {
      await api.post('/auth/register', { full_name, email, password });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'فشل إنشاء الحساب. تأكد من صحة البيانات.';
      return { success: false, message: errorMessage };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
