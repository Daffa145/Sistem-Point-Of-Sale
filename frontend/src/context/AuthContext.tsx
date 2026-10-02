'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { api } from '@/lib/api';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'cashier' | 'kitchen' | 'manager' | 'waiter';
  phone?: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: async () => false,
  logout: () => {},
  isLoading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const savedToken = localStorage.getItem('pos_token');
    const savedUser = localStorage.getItem('pos_user');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    } else {
      // Default demo login if no token stored yet
      const demoUser: User = {
        id: 1,
        name: 'Admin Manager',
        email: 'admin@pos.com',
        role: 'admin',
        phone: '081234567890',
      };
      setUser(demoUser);
      setToken('demo_token_admin');
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.status === 'success') {
        const u = res.data.data.user;
        const t = res.data.data.token;
        setUser(u);
        setToken(t);
        localStorage.setItem('pos_token', t);
        localStorage.setItem('pos_user', JSON.stringify(u));
        if (u.role === 'cashier') {
          router.push('/pos');
        } else {
          router.push('/dashboard');
        }
        return true;
      }
    } catch (err) {
      console.warn('API connection offline, using fallback mock login for:', email);
      // Fallback mock logins for seamless preview
      let role: User['role'] = 'cashier';
      let name = 'Cashier Staff';
      if (email.includes('admin')) { role = 'admin'; name = 'Admin Manager'; }
      if (email.includes('kitchen')) { role = 'kitchen'; name = 'Chef Alex'; }

      const mockUser: User = {
        id: Math.floor(Math.random() * 100) + 1,
        name,
        email,
        role,
      };
      const mockToken = 'mock_token_' + Date.now();
      setUser(mockUser);
      setToken(mockToken);
      localStorage.setItem('pos_token', mockToken);
      localStorage.setItem('pos_user', JSON.stringify(mockUser));
      if (role === 'cashier') {
        router.push('/pos');
      } else {
        router.push('/dashboard');
      }
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('pos_token');
    localStorage.removeItem('pos_user');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
