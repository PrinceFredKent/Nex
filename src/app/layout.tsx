import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import TopHeader from '@/components/TopHeader';
import FloatingDock from '@/components/FloatingDock';
import { WatchlistProvider } from '@/components/WatchlistProvider';
import { AuthProvider } from '@/components/AuthProvider';

export const metadata: Metadata = {
  title: 'Nex | Stream Movies & TV Shows',
  description: 'Watch unlimited movies, TV shows, and series in HD with instant multi-server streaming.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-surface-app text-gray-900 min-h-screen flex flex-col antialiased selection:bg-brand-500 selection:text-white p-3 sm:p-5 pb-24">
        <AuthProvider>
          <WatchlistProvider>
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
        </WatchlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
