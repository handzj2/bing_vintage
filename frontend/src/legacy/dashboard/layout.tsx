'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/layout/sidebar/Sidebar'; // Your Desktop Sidebar
import MobileSidebar from '@/components/layout/sidebar/MobileSidebar'; // The new Mobile Nav
import Topbar from '@/components/layout/topbar/Topbar';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 1. Desktop Sidebar: Remains on the left for large screens */}
      <Sidebar />

      <div className="lg:pl-64 flex-1 flex flex-col">
        {/* 2. Topbar: Keep it for profile and search */}
        <Topbar />

        {/* 3. Main Content: 
            IMPORTANT: We add 'pb-24' (bottom padding) for mobile only.
            This ensures that when your staff is scrolling through payments, 
             the Bottom Nav doesn't block the last item or the 'Record' button.
        */}
        <main className="py-6 flex-1 pb-24 lg:pb-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>

      {/* 4. Mobile Bottom Nav: Only visible on small screens */}
      <MobileSidebar />
    </div>
  );
}