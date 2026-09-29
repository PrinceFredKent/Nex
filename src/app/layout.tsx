import type { Metadata, Viewport } from 'next';
import './globals.css';
import AppShell from '@/components/AppShell';
import { WatchlistProvider } from '@/components/WatchlistProvider';
import { AuthProvider } from '@/components/AuthProvider';

export const metadata: Metadata = {
  title: 'Nex 1.2 | Stream Movies & TV Shows',
  description: 'Watch unlimited movies, TV shows, and series in HD with instant multi-server streaming.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-surface-app text-gray-900 min-h-screen antialiased selection:bg-brand-500 selection:text-white">
        <AuthProvider>
          <WatchlistProvider>
            <AppShell>
              {children}
            </AppShell>
          </WatchlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
