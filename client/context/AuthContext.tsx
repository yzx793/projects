import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = (process.env.EXPO_PUBLIC_API_BASE ?? '').replace(/\/$/, '');

export interface User {
  id: number;
  username: string;
  role: 'student' | 'teacher';
  grade?: string;
  avatar: string;
  level: number;
  exp: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (username: string, password: string, role: 'student' | 'teacher', grade?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const stored = await AsyncStorage.getItem('auth_user');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Load user error:', e);
    } finally {
      setLoading(false);
    }
  };

  const login = useCallback(async (username: string, password: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const json = await res.json();
      if (json.code === 0) {
        const userData: User = json.data;
        setUser(userData);
        await AsyncStorage.setItem('auth_user', JSON.stringify(userData));
        return { success: true };
      }
      return { success: false, message: json.message || '登录失败' };
    } catch (e: any) {
      return { success: false, message: e.message || '网络错误' };
    }
  }, []);

  const register = useCallback(async (username: string, password: string, role: 'student' | 'teacher', grade?: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/user/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role, grade }),
      });
      const json = await res.json();
      if (json.code === 0) {
        const userData: User = json.data;
        setUser(userData);
        await AsyncStorage.setItem('auth_user', JSON.stringify(userData));
        return { success: true };
      }
      return { success: false, message: json.message || '注册失败' };
    } catch (e: any) {
      return { success: false, message: e.message || '网络错误' };
    }
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    await AsyncStorage.removeItem('auth_user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}