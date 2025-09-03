'use client';

import { createContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => void;
  logout: () => void;
  register: (name: string, email: string, pass: string) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user database
const mockUsers: User[] = [
  { id: '1', name: 'Demo User', email: 'user@demo.com', password: 'password123' },
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Simulate checking for a logged-in user in localStorage
    try {
      const storedUser = localStorage.getItem('chargesmart_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
        console.error("Could not parse user from localStorage", error)
    } finally {
        setLoading(false);
    }
  }, []);

  const login = (email: string, pass: string) => {
    const foundUser = mockUsers.find(u => u.email === email && u.password === pass);
    if (foundUser) {
      const { password, ...userToStore } = foundUser;
      setUser(userToStore);
      localStorage.setItem('chargesmart_user', JSON.stringify(userToStore));
    } else {
      throw new Error('Invalid email or password');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('chargesmart_user');
    router.push('/login');
  };

  const register = (name: string, email: string, pass: string) => {
    if (mockUsers.find(u => u.email === email)) {
      throw new Error('User with this email already exists');
    }
    const newUser: User = { id: String(mockUsers.length + 1), name, email, password: pass };
    mockUsers.push(newUser);
    const { password, ...userToStore } = newUser;
    setUser(userToStore);
    localStorage.setItem('chargesmart_user', JSON.stringify(userToStore));
  };

  const value = { user, loading, login, logout, register };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
