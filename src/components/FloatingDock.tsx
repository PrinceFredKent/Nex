'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Heart, Download, Bell, Tv, User, Shield } from 'lucide-react';

export default function FloatingDock() {
  const pathname = usePathname();

  const dockItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Favorites', href: '/watchlist', icon: Heart },
    { label: 'Browse', href: '/browse', icon: Download },
    { label: 'Notifications', href: '/admin', icon: Bell },
    { label: 'TV Shows', href: '/browse?type=tv', icon: Tv },
    { label: 'Admin', href: '/admin', icon: User },
  ];

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40">
      <nav className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-cinemaDark-900/95 backdrop-blur-xl border border-white/15 shadow-dock">
        {dockItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;

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
