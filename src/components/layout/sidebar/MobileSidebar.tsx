'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, CreditCard, DollarSign, BarChart3, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function MobileSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  // Primary mobile actions for field staff
  const navItems = [
    { name: 'Home', href: '/dashboard', icon: Home },
    { name: 'Pay', href: '/dashboard/payments', icon: CreditCard },
    { name: 'Loans', href: '/dashboard/loans', icon: DollarSign },
    { name: 'Reports', href: '/dashboard/reports', icon: BarChart3, adminOnly: true },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          // Hide admin reports from staff
          if (item.adminOnly && user?.role !== 'admin') return null;

          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link 
              key={item.name} 
              href={item.href}
              className="flex flex-col items-center justify-center w-full h-full"
            >
              <Icon className={`w-6 h-6 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
              <span className={`text-[10px] mt-1 font-medium ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                {item.name}
              </span>
              {isActive && (
                <div className="absolute bottom-0 w-8 h-1 bg-blue-600 rounded-t-full" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}