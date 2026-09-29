'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Heart, User, Settings, Play, Shield } from 'lucide-react';
import { useWatchlist } from './WatchlistProvider';
import { useAuth } from './AuthProvider';

export default function Sidebar() {
  const pathname = usePathname();
  const { history, watchlist } = useWatchlist();
  const { profile, isAdmin } = useAuth();

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Explore', href: '/browse', icon: Compass, hasDot: true },
    { label: 'Favorite', href: '/watchlist', icon: Heart, count: watchlist.length },
    ...(profile ? [{ label: 'Profile', href: '/profile', icon: User }] : [{ label: 'Sign In', href: '/auth/login', icon: User }]),
    { label: 'Admin Panel', href: '/admin', icon: Shield },
    { label: 'Settings', href: '/admin?tab=settings', icon: Settings },
  ];

  const continueWatchingItems = history.slice(0, 4);

  return (
    <aside className="w-64 bg-white dark:bg-[#141721] rounded-3xl p-6 flex flex-col justify-between shadow-app shrink-0 border border-slate-100/80 dark:border-white/10">
      <div className="space-y-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center justify-between group">
          <div className="flex items-center gap-2">
            <span className="text-sm font-black tracking-wider text-brand-500 uppercase font-sans flex items-center gap-1.5">
              NEX
            </span>
          </div>
        </Link>

        {/* Navigation Menu */}
        <nav className="space-y-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href.split('?')[0]));
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center justify-between group transition-all text-sm font-semibold ${
                  isActive ? 'text-brand-500 font-bold' : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-500' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'} transition-colors`} />
                  <span>{item.label}</span>
                </div>
                {item.hasDot && (
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />
                )}
                {item.count !== undefined && item.count > 0 && (
                  <span className="text-xs bg-brand-500/10 text-brand-500 px-1.5 py-0.2 rounded-full font-bold">
                    {item.count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Continue Watching Section - only shown when user has watched titles */}
        {continueWatchingItems.length > 0 && (
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold text-gray-800 dark:text-gray-200 tracking-tight">
              Continue watching
            </h3>

            <div className="space-y-2.5">
              {continueWatchingItems.map((item, idx) => {
                const isTv = (item.type === 'tv' || item.mediaId.startsWith('tv-')) && item.type !== 'movie' && !item.mediaId.startsWith('movie-');
                return (
                  <Link
                    key={`${item.mediaId}-${idx}`}
                    href={`/watch/${item.mediaId}`}
                    className="flex items-center justify-between p-1 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={item.posterUrl}
                        alt={item.mediaTitle}
                        className="w-10 h-8 object-cover rounded-lg shrink-0 shadow-sm"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-800 dark:text-gray-200 truncate group-hover:text-brand-500 transition">
                          {item.mediaTitle}
                        </p>
                        <p className="text-[10px] text-gray-400 font-medium">
                          {isTv ? `EP ${item.episode || 1}` : 'Movie'}
                        </p>
                      </div>
                    </div>

                    <div className="w-6 h-6 rounded-full bg-black dark:bg-white/20 text-white flex items-center justify-center shrink-0 group-hover:bg-brand-500 group-hover:scale-105 transition">
                      <Play className="w-2.5 h-2.5 fill-white ml-0.5" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* App Status Info */}
      <div className="pt-4 mt-6 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-[11px] text-gray-400">
        <span className="font-semibold text-gray-500 dark:text-gray-400">Nex Streaming</span>
        <span className="flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
          <span>Online</span>
        </span>
      </div>
    </aside>
  );
}
