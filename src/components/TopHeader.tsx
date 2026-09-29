'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search, Bell, ChevronDown, User, Shield, Heart, LogOut, LogIn } from 'lucide-react';
import SearchModal from './SearchModal';
import ThemeToggle from './ThemeToggle';
import { useAuth } from './AuthProvider';

const CATEGORIES = [
  { label: 'Movies', href: '/browse?type=movie' },
  { label: 'TV Series', href: '/browse?type=tv' },
  { label: 'Animation', href: '/browse?genre=Animation' },
  { label: 'Thriller', href: '/browse?genre=Thriller' },
  { label: 'Drama', href: '/browse?genre=Drama' },
  { label: 'More', href: '/browse' },
];

function CategoryPills() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentType = searchParams.get('type');
  const currentGenre = searchParams.get('genre');

  const isSelectedCategory = (cat: typeof CATEGORIES[0]) => {
    if (pathname !== '/browse') return false;
    if (cat.label === 'Movies' && currentType === 'movie') return true;
    if (cat.label === 'TV Series' && currentType === 'tv') return true;
    if (cat.label === 'Animation' && currentGenre === 'Animation') return true;
    if (cat.label === 'Thriller' && currentGenre === 'Thriller') return true;
    if (cat.label === 'Drama' && currentGenre === 'Drama') return true;
    if (cat.label === 'More' && !currentType && !currentGenre) return true;
    return false;
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 w-full md:w-auto justify-start md:justify-center">
      {CATEGORIES.map((cat) => {
        const active = isSelectedCategory(cat);
        return (
          <Link
            key={cat.label}
            href={cat.href}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all shadow-sm ${
              active
                ? 'bg-brand-500 text-white shadow-brand-500/20'
                : 'bg-white dark:bg-darkCard text-gray-700 dark:text-gray-200 hover:text-gray-950 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/10 border border-slate-100/80 dark:border-white/10'
            }`}
          >
            {cat.label}
          </Link>
        );
      })}
    </div>
  );
}

function CategoryPillsFallback() {
  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 w-full md:w-auto justify-start md:justify-center">
      {CATEGORIES.map((cat) => (
        <Link
          key={cat.label}
          href={cat.href}
          className="px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap bg-white dark:bg-darkCard text-gray-700 dark:text-gray-200 border border-slate-100/80 dark:border-white/10"
        >
          {cat.label}
        </Link>
      ))}
    </div>
  );
}

export default function TopHeader() {
  const router = useRouter();
  const { profile, signOut, isAdmin, isLoading } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <header className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 w-full">
        {/* Left: Search Input Pill */}
        <div className="w-full md:w-60 lg:w-64 shrink-0 flex items-center gap-2.5">
          <Link
            href="/"
            className="md:hidden shrink-0 flex items-center gap-1.5 bg-white dark:bg-darkCard px-3 py-2 rounded-full border border-slate-100/80 dark:border-white/10 shadow-sm"
          >
            <span className="text-xs font-black tracking-wider text-brand-500 uppercase font-sans">NEX</span>
          </Link>
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex-1 md:w-full bg-white dark:bg-darkCard rounded-full px-4 py-2.5 flex items-center gap-2.5 shadow-sm border border-slate-100/80 dark:border-white/10 text-gray-400 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition text-sm text-left group"
          >
            <Search className="w-4 h-4 text-gray-400 group-hover:text-brand-500 transition-colors shrink-0" />
            <span className="text-gray-400 dark:text-gray-400 text-xs sm:text-sm font-medium">Search</span>
          </button>
        </div>

        {/* Center: Category Pills wrapped in Suspense */}
        <Suspense fallback={<CategoryPillsFallback />}>
          <CategoryPills />
        </Suspense>

        {/* Right: Theme Toggle, Admin, Notification & Profile Pills */}
        <div className="flex items-center gap-2.5 shrink-0 ml-auto md:ml-0">
          {/* Theme Toggle Button */}
          <ThemeToggle />

          {/* Direct Admin & Add Movies Button */}
          <Link
            href="/admin"
            className="flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white px-3.5 py-1.5 rounded-full shadow-sm text-xs font-bold transition shrink-0"
            title="Admin Center - Add & Manage Movies"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin</span>
          </Link>

          {/* Notification Bell */}
          <Link
            href={isAdmin ? "/admin" : "/watchlist"}
            title={isAdmin ? "Admin & System Alerts" : "Saved Watchlist & Activity"}
            className="w-9 h-9 rounded-full bg-white dark:bg-darkCard flex items-center justify-center text-gray-600 dark:text-gray-200 hover:text-brand-500 dark:hover:text-brand-400 shadow-sm border border-slate-100/80 dark:border-white/10 transition shrink-0"
          >
            <Bell className="w-4 h-4" />
          </Link>

          {/* Profile Pill or Sign In Button */}
          {profile ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 bg-white dark:bg-darkCard pl-1.5 pr-3 py-1 rounded-full shadow-sm border border-slate-100/80 dark:border-white/10 hover:border-brand-500/30 transition group"
              >
                <img
                  src={profile.avatarUrl || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(profile.email)}`}
                  alt={profile.fullName}
                  className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                />
                <span className="text-xs font-bold text-gray-800 dark:text-gray-200 group-hover:text-brand-500 transition max-w-[100px] truncate">
                  {profile.fullName}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200" />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#181b24] rounded-2xl shadow-xl border border-slate-100 dark:border-white/10 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-white/10">
                    <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{profile.fullName}</p>
                    <p className="text-[10px] text-gray-400 truncate">{profile.email}</p>
                  </div>

                  <Link
                    href="/profile"
                    onClick={() => setIsDropdownOpen(false)}
                    className="w-full px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-white/10 hover:text-brand-500 flex items-center gap-2.5 transition"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>My Profile</span>
                  </Link>

                  <Link
                    href="/watchlist"
                    onClick={() => setIsDropdownOpen(false)}
                    className="w-full px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-slate-50 dark:hover:bg-white/10 hover:text-brand-500 flex items-center gap-2.5 transition"
                  >
                    <Heart className="w-3.5 h-3.5" />
                    <span>Favorite Watchlist</span>
                  </Link>

                  <Link
                    href="/admin"
                    onClick={() => setIsDropdownOpen(false)}
                    className="w-full px-4 py-2 text-xs font-bold text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/10 flex items-center gap-2.5 transition"
                  >
                    <Shield className="w-3.5 h-3.5 text-brand-500" />
                    <span>Admin & Add Movies</span>
                  </Link>

                  <div className="border-t border-slate-100 dark:border-white/10 my-1" />

                  <button
                    onClick={async () => {
                      setIsDropdownOpen(false);
                      await signOut();
                      router.push('/');
                    }}
                    className="w-full px-4 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2.5 transition text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/auth/login"
              className="flex items-center gap-1.5 bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-gray-800 dark:text-gray-200 px-3.5 py-1.5 rounded-full shadow-sm text-xs font-bold transition"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </header>

      {/* Global Search Lightbox */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
