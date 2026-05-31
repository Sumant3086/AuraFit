import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL || '/api';

// Axios instance with auto token refresh
const apiClient = axios.create({ baseURL: API_URL });

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && error.response?.data?.code === 'TOKEN_EXPIRED' && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        localStorage.setItem('accessToken', data.data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return apiClient(originalRequest);
      } catch {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');
    if (!token) { setLoading(false); return; }

    // Load from storage immediately for instant UI
    if (storedUser) {
      try { setUser(JSON.parse(storedUser)); setIsAuthenticated(true); } catch {}
    }

    try {
      const { data } = await apiClient.get('/auth/me');
      const freshUser = data.data;
      setUser(freshUser);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(freshUser));
    } catch {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUser(); }, [loadUser]);

  const login = useCallback((userData, tokens) => {
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const updateUser = useCallback((updates) => {
    setUser(prev => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Role helpers
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin' || user?.role === 'gym_admin';
  const isSuperAdmin = user?.role === 'super_admin' || user?.role === 'admin';
  const isTrainer = user?.role === 'trainer';
  const isGymAdmin = user?.role === 'gym_admin' || isSuperAdmin;
  const isMember = !isAdmin && !isTrainer;
  const needsOnboarding = isAuthenticated && user && !user.onboardingCompleted;

  return (
    <AuthContext.Provider value={{
      user, loading, isAuthenticated,
      isAdmin, isSuperAdmin, isTrainer, isGymAdmin, isMember,
      needsOnboarding,
      login, logout, updateUser, loadUser,
      apiClient,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export { apiClient };
export default AuthContext;
