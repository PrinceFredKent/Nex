'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search, Bell, ChevronDown } from 'lucide-react';
import SearchModal from './SearchModal';

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
    if (cat.label === 'Movies' && (currentType === 'movie' || pathname === '/')) return true;
    if (cat.label === 'TV Series' && currentType === 'tv') return true;
    if (cat.label === 'Animation' && currentGenre === 'Animation') return true;
    if (cat.label === 'Thriller' && currentGenre === 'Thriller') return true;
    if (cat.label === 'Drama' && currentGenre === 'Drama') return true;
    return false;
  };

  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 w-full lg:w-auto justify-start lg:justify-center">
      {CATEGORIES.map((cat) => {
        const active = isSelectedCategory(cat);
        return (
          <Link
            key={cat.label}
            href={cat.href}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all shadow-sm ${
              active
                ? 'bg-brand-500 text-white shadow-brand-500/20'
                : 'bg-white text-gray-700 hover:text-gray-950 hover:bg-slate-50 border border-slate-100/80'
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
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 w-full lg:w-auto justify-start lg:justify-center">
      {CATEGORIES.map((cat) => (
        <Link
          key={cat.label}
          href={cat.href}
          className="px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap bg-white text-gray-700 border border-slate-100/80"
        >
          {cat.label}
        </Link>
      ))}
    </div>
  );
}

export default function TopHeader() {
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <header className="flex flex-col lg:flex-row items-center justify-between gap-4 w-full">
        {/* Left: Search Input Pill */}
        <div className="w-full lg:w-64 shrink-0">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-full bg-white rounded-full px-4 py-2.5 flex items-center gap-2.5 shadow-sm border border-slate-100/80 text-gray-400 hover:text-gray-600 transition text-sm text-left group"
          >
            <Search className="w-4 h-4 text-gray-400 group-hover:text-brand-500 transition-colors shrink-0" />
            <span className="text-gray-400 text-xs sm:text-sm font-medium">Search</span>
          </button>
        </div>

        {/* Center: Category Pills wrapped in Suspense */}
        <Suspense fallback={<CategoryPillsFallback />}>
          <CategoryPills />
        </Suspense>

        {/* Right: Notification & Profile Pills */}
        <div className="flex items-center gap-3 shrink-0 ml-auto lg:ml-0">
          {/* Notification Bell */}
          <button
            onClick={() => router.push('/admin')}
            title="Admin notifications"
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-600 hover:text-brand-500 shadow-sm border border-slate-100/80 transition"
          >
            <Bell className="w-4 h-4" />
          </button>

          {/* Profile Pill */}
          <Link
            href="/admin"
            className="flex items-center gap-2.5 bg-white pl-1.5 pr-3 py-1 rounded-full shadow-sm border border-slate-100/80 hover:border-brand-500/30 transition group"
          >
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop"
              alt="Alex Morgan"
              className="w-7 h-7 rounded-full object-cover border border-slate-200"
            />
            <span className="text-xs font-bold text-gray-800 group-hover:text-brand-500 transition">
              Alex Morgan
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-700" />
          </Link>
        </div>
      </header>

      {/* Global Search Lightbox */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
