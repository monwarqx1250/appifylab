'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { postAuth, api, persistAuthSession, TOKEN_STORAGE_KEY } from '@/lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }
    
    const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    console.log('Auth init - storedToken:', storedToken ? 'exists' : 'none');
    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
      api.get('/auth/me').then(result => {
        console.log('Auth /me result:', result);
        if (result.ok && result.data) {
          setUser(result.data);
          setIsLoading(false);
        } else {
          console.log('Auth /me failed, clearing session');
          localStorage.removeItem(TOKEN_STORAGE_KEY);
          setToken(null);
          setIsAuthenticated(false);
          setIsLoading(false);
        }
      });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const { ok, status, data } = await postAuth('/auth/login', { email, password });
    
    if (ok && status === 200 && data) {
      persistAuthSession(data);
      setToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);
      return { success: true };
    }
    
    return { 
      success: false, 
      error: data?.error || 'Login failed' 
    };
  };

  const register = async (userData) => {
    const { ok, status, data } = await postAuth('/auth/register', userData);
    
    if (ok && status === 201 && data) {
      persistAuthSession(data);
      setToken(data.token);
      setUser(data.user);
      setIsAuthenticated(true);
      return { success: true };
    }
    
    return { 
      success: false, 
      error: data?.error || 'Registration failed' 
    };
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated,
      isLoading,
      login,
      register,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
