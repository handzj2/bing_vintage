'use client';

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, Mail, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      // ✅ FIXED: Map formData.email to the 'username' key expected by AuthContext
      await login({
        username: formData.email,  // Changed from email to username
        password: formData.password,
      });
      
      // Navigation is handled inside AuthContext, but router.push is here as backup
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Access Denied. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * FIXED DEVELOPMENT HELPER
   * Creates the exact user format expected by AuthContext
   */
  const handleSetupDefaultAdmin = () => {
    const staff = [
      {
        id: `admin-${Date.now()}`,
        name: 'System Admin',
        email: 'admin@bingovintage.com',
        password: 'admin123',
        role: 'admin', // Essential for reversal/edit permissions [cite: 2026-01-10]
      },
      {
        id: `staff-${Date.now()}`,
        name: 'John Cashier',
        email: 'staff@bingovintage.com',
        password: 'password123',
        role: 'cashier',
      }
    ];
    
    // Save to the key used by AuthContext
    localStorage.setItem('bingo_staff', JSON.stringify(staff));
    setFormData({ email: 'admin@bingovintage.com', password: 'admin123' });
    setError('Success: Test users created. Click Sign In.');
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-slate-200">
        
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-xl shadow-lg shadow-blue-100">
              <ShieldCheck className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Bingo Vintage</h1>
          <p className="text-blue-600 font-bold text-sm uppercase tracking-widest mt-1">Staff Portal</p>
          
          <div className="mt-4 pt-3 border-t border-slate-100">
            <p className="text-xs text-slate-500 italic font-medium">
              "Only Admin can reverse or correct transactions" [cite: 2026-01-10]
            </p>
          </div>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1 ml-1">Staff Email or Username</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"
                  placeholder="admin@bingovintage.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1 ml-1">Security Key</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-slate-400" />
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full pl-10 pr-12 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className={`rounded-lg p-3 text-sm flex gap-3 ${error.includes('Success') ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Sign In to Portal'}
          </button>

          <div className="pt-6 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={handleSetupDefaultAdmin}
              className="text-[10px] font-bold text-slate-400 hover:text-blue-600 uppercase tracking-tighter"
            >
              Reset/Initialize Local Staff Database
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}