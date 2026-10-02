'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { NotificationProvider } from '@/context/NotificationContext';

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === 'cashier' && pathname !== '/pos') {
        router.replace('/pos');
      }
      if (user.role === 'kitchen' && pathname !== '/kitchen') {
        router.replace('/kitchen');
      }
    }
  }, [user, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (user?.role === 'cashier' && pathname !== '/pos') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-sm text-gray-500 font-medium">Redirecting to POS Cashier...</p>
      </div>
    );
  }

  if (user?.role === 'kitchen' && pathname !== '/kitchen') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-sm text-gray-500 font-medium">Redirecting to Kitchen Display...</p>
      </div>
    );
  }

  // Cashier & Kitchen staff view: Fullscreen tablet mode (No Sidebar, No Navbar)
  // Admin & Manager will see standard layout with Sidebar & Header
  if (user?.role === 'cashier' || user?.role === 'kitchen') {
    return (
      <div className="h-screen w-screen bg-gray-100 overflow-hidden p-2 sm:p-3">
        <main className="h-full w-full">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-60 h-full overflow-hidden">
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto flex flex-col min-h-0 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <DashboardLayoutContent>{children}</DashboardLayoutContent>
      </NotificationProvider>
    </AuthProvider>
  );
};
