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

  const isWatchPage = pathname.startsWith('/watch');

  return (
    <div className={`min-h-screen px-2.5 sm:px-5 ${isWatchPage ? 'pb-8 bg-[#0d0f14]' : 'pb-24'}`}>
      {/* Main App Container */}
      <div className="max-w-[1800px] mx-auto w-full flex flex-col">
        {/* Sticky Top Navigation Bar */}
        <div className="sticky top-0 z-40 bg-surface-app/90 dark:bg-[#0b0d12]/90 backdrop-blur-md pt-2.5 sm:pt-4 pb-2.5 sm:pb-3 -mx-2.5 sm:-mx-5 px-2.5 sm:px-5 transition-colors">
          <TopHeader />
        </div>

        {/* Main Center Area: Sidebar + Content */}
        <div className="flex flex-col md:flex-row gap-4 lg:gap-6 items-start mt-2 sm:mt-3">
          {/* Sticky Left Sidebar */}
          <div className="hidden md:block shrink-0 sticky top-[74px] sm:top-[82px] self-start max-h-[calc(100vh-96px)] overflow-y-auto no-scrollbar z-30">
            <Sidebar />
          </div>

          {/* Dynamic Page Content */}
          <main className="flex-1 min-w-0 w-full">
            {children}
          </main>
        </div>
      </div>

      {/* Floating Dock at bottom center */}
      <FloatingDock />
    </div>
  );
}
