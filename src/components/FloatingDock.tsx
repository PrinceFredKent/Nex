'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Heart, Shield, User } from 'lucide-react';
import { useAuth } from './AuthProvider';

export default function FloatingDock() {
  const pathname = usePathname();
  const { profile } = useAuth();

  const dockItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Explore', href: '/browse', icon: Compass },
    { label: 'Admin', href: '/admin', icon: Shield, isSpecial: true },
    { label: 'Favorites', href: '/watchlist', icon: Heart },
    { label: profile ? 'Profile' : 'Sign In', href: profile ? '/profile' : '/auth/login', icon: User },
  ];

  // Hide floating dock on watch player page to prevent blocking video controls or server buttons
  if (pathname.startsWith('/watch')) {
    return null;
  }

  return (
    <div className="md:hidden fixed bottom-4 sm:bottom-5 left-1/2 -translate-x-1/2 z-40 max-w-[96vw]">
      <nav className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full bg-cinemaDark-900/95 backdrop-blur-xl border border-white/15 shadow-dock">
        {dockItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;

          if (item.isSpecial) {
            return (
              <Link
                key={item.label}
                href={item.href}
                title="Admin Panel - Add & Manage Movies"
                className={`relative px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all text-xs font-bold ${
                  isActive
                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/40 ring-2 ring-brand-400/50'
                    : 'bg-brand-500/20 text-brand-400 hover:bg-brand-500/30 border border-brand-500/40 hover:text-white'
                }`}
              >
                <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-400 group-hover:text-white" />
                <span className="text-[11px] font-bold tracking-tight">Admin</span>
              </Link>
            );
          }

          if (isActive) {
            return (
              <Link
                key={item.label}
                href={item.href}
                title={item.label}
                className="w-9 h-9 rounded-full bg-brand-500 text-white flex items-center justify-center shadow-lg shadow-brand-500/40 transition-transform hover:scale-105"
              >
                <Icon className="w-4 h-4" />
              </Link>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              title={item.label}
              className="w-9 h-9 rounded-full hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition"
            >
              <Icon className="w-4 h-4" />
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
