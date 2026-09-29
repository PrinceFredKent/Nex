import type { Metadata, Viewport } from 'next';
import './globals.css';
import AppShell from '@/components/AppShell';
import { WatchlistProvider } from '@/components/WatchlistProvider';
import { AuthProvider } from '@/components/AuthProvider';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ToastProvider } from '@/components/ToastProvider';

export const metadata: Metadata = {
  title: 'Nex Streaming Platform',
  description: 'Premium movie and series streaming platform with interactive discovery, watchlists, AI recommendations, and custom collections.',
  openGraph: {
    title: 'Nex Streaming Platform',
    description: 'Premium movie and series streaming platform with interactive discovery, watchlists, AI recommendations, and custom collections.',
  },
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
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
    <html lang="en" suppressHydrationWarning>
      <body className="bg-surface-app dark:bg-[#0b0d12] text-gray-900 dark:text-gray-100 min-h-screen antialiased selection:bg-brand-500 selection:text-white transition-colors duration-200">
        <ThemeProvider>
          <AuthProvider>
            <WatchlistProvider>
              <ToastProvider>
                <AppShell>
                  {children}
                </AppShell>
              </ToastProvider>
            </WatchlistProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
