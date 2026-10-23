import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../api/services';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('hireflow_token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('hireflow_token');
      if (storedToken) {
        try {
          const res = await authService.getCurrentUser();
          if (res?.success && res.data) {
            setUser(res.data);
            localStorage.setItem('hireflow_user', JSON.stringify(res.data));
          }
        } catch (err) {
          console.error('Session verification failed', err);
          localStorage.removeItem('hireflow_token');
          localStorage.removeItem('hireflow_refresh_token');
          localStorage.removeItem('hireflow_user');
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authService.login(email, password);
    if (res?.success && res.data) {
      const { accessToken, refreshToken, user: authUser } = res.data;
      localStorage.setItem('hireflow_token', accessToken);
      if (refreshToken) {
        localStorage.setItem('hireflow_refresh_token', refreshToken);
      }
      localStorage.setItem('hireflow_user', JSON.stringify(authUser));
      setToken(accessToken);
      setUser(authUser);
      return authUser;
    }
    throw new Error(res?.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    if (res?.success && res.data) {
      const { accessToken, refreshToken, user: authUser } = res.data;
      localStorage.setItem('hireflow_token', accessToken);
      if (refreshToken) {
        localStorage.setItem('hireflow_refresh_token', refreshToken);
      }
      localStorage.setItem('hireflow_user', JSON.stringify(authUser));
      setToken(accessToken);
      setUser(authUser);
      return authUser;
    }
    throw new Error(res?.message || 'Registration failed');
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('hireflow_refresh_token');
    await authService.logout(refreshToken);
    setUser(null);
    setToken(null);
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => {
      const updated = { ...prev, ...updatedFields };
      localStorage.setItem('hireflow_user', JSON.stringify(updated));
      return updated;
    });
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    role: user?.role,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
