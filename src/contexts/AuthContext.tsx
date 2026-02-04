'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api/client';

interface User {
  id: number; // CHANGED from string to number (matches backend)
  username: string; // ADDED username field
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  phone?: string;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: { username: string; password: string }) => Promise<void>; // CHANGED from email to username
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// THE ONE-LINE SWITCH: true for Mock DB (localStorage), false for Real API
const USE_MOCK_DB = false; 

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const savedUser = localStorage.getItem('user');
      const token = localStorage.getItem('access_token');
      
      if (savedUser && token) {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        
        if (!USE_MOCK_DB) {
          api.setToken(token);
          await refreshUser();
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Clean up on failure
      document.cookie = "pb_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax";
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    if (USE_MOCK_DB) return;
    try {
      const response = await api.get('/auth/me');
      if (response.success && response.data) {
        const userData = response.data;
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const login = async (credentials: { username: string; password: string }) => { // CHANGED parameter
    setIsLoading(true);
    try {
      if (USE_MOCK_DB) {
        const staff = JSON.parse(localStorage.getItem('bingo_staff') || '[]');
        const mockUser = staff.find((u: any) => 
          u.email === credentials.username && u.password === credentials.password // CHANGED: compare email with username field
        );

        if (mockUser) {
          const userData: User = {
            id: parseInt(mockUser.id) || Date.now(), // Convert to number
            username: mockUser.email, // Use email as username for mock
            email: mockUser.email,
            first_name: mockUser.name?.split(' ')[0] || 'Staff',
            last_name: mockUser.name?.split(' ')[1] || 'Member',
            role: mockUser.role || 'cashier',
          };
          
          const token = 'mock_token_' + Date.now();
          
          // --- BEST PRACTICE: NATIVE COOKIE FOR MIDDLEWARE ---
          document.cookie = `pb_auth=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
          
          setUser(userData);
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('access_token', token);
          
          const logs = JSON.parse(localStorage.getItem('bingo_audit_logs') || '[]');
          logs.push({
            id: `audit-${Date.now()}`,
            action: 'USER_LOGIN',
            performedBy: `${userData.first_name} ${userData.last_name}`,
            details: `${userData.email} (${userData.role}) logged in`,
            timestamp: new Date().toISOString()
          });
          localStorage.setItem('bingo_audit_logs', JSON.stringify(logs));
        } else {
          throw new Error('Access Denied. Incorrect credentials.');
        }
      } else {
        // CHANGED: Send username field instead of email
        const response = await api.post('/auth/login', {
          username: credentials.username, // CHANGED: use username field
          password: credentials.password,
        });
        
        if (response.success && response.data) {
          const { user: userData, access_token } = response.data;
          
          // Map backend user to frontend User interface
          const mappedUser: User = {
            id: userData.id,
            username: userData.username,
            email: userData.email,
            first_name: userData.fullName ? userData.fullName.split(' ')[0] : userData.username,
            last_name: userData.fullName ? userData.fullName.split(' ').slice(1).join(' ') : '',
            role: userData.role,
          };
          
          // --- BEST PRACTICE: NATIVE COOKIE FOR MIDDLEWARE ---
          document.cookie = `pb_auth=${access_token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;

          api.setToken(access_token);
          localStorage.setItem('access_token', access_token);
          localStorage.setItem('user', JSON.stringify(mappedUser)); // Store mapped user
          setUser(mappedUser);
        } else {
          throw new Error(response.message || 'Login failed.');
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      // Provide more specific error message
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        throw new Error('Invalid credentials. Please check your username/email and password.');
      } else if (error.message?.includes('Network')) {
        throw new Error('Network error. Please check if the backend server is running.');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // 1. Clear Native Cookie
    document.cookie = "pb_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax";
    
    // 2. Clear Local Storage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    
    // 3. Reset User State (api.clearToken removed to fix crash)
    setUser(null);
    router.push('/auth/login');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}