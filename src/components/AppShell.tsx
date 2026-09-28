'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import TopHeader from './TopHeader';
import Sidebar from './Sidebar';
import FloatingDock from './FloatingDock';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname.startsWith('/auth');

  if (isAuthPage) {
    return (
      <main className="min-h-screen w-full flex items-center justify-center bg-surface-app p-4 sm:p-6">
        {children}
      </main>
    );
  }

  return (
    <div className="p-3 sm:p-5 pb-24">
      {/* Main App Container */}
      <div className="max-w-[1440px] mx-auto w-full flex flex-col space-y-4">
        {/* Top Navigation Bar */}
        <TopHeader />

        {/* Main Center Area: Sidebar + Content */}
        <div className="flex flex-col lg:flex-row gap-5 items-stretch">
          {/* Left Sidebar */}
          <div className="hidden lg:block shrink-0">
            <Sidebar />
          </div>

          {/* Dynamic Page Content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>

      {/* Floating Dock at bottom center */}
      <FloatingDock />
    </div>
  );
}
