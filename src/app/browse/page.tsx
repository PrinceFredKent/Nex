'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { MediaItem } from '@/types';
import CardYouMightLike from '@/components/CardYouMightLike';
import { Search, SlidersHorizontal, Film, Tv, RefreshCw } from 'lucide-react';

const GENRES = [
  'All',
  'Action',
  'Adventure',
  'Animation',
  'Comedy',
  'Crime',
  'Drama',
  'Fantasy',
  'Horror',
  'Science Fiction',
  'Thriller',
];

function BrowseContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const currentType = searchParams.get('type') || 'all';
  const currentGenre = searchParams.get('genre') || 'All';
  const currentSort = searchParams.get('sort') || 'newest_added';
  const currentSearch = searchParams.get('search') || '';

  const [searchTerm, setSearchTerm] = useState(currentSearch);

  useEffect(() => {
    fetchMedia();
  }, [currentType, currentGenre, currentSort, currentSearch]);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (currentType !== 'all') params.set('type', currentType);
      if (currentGenre !== 'All') params.set('genre', currentGenre);
      if (currentSort) params.set('sort', currentSort);
      if (currentSearch) params.set('search', currentSearch);

      const res = await fetch(`/api/movies?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setItems(json.data);
      }
    } catch (e) {
      console.error('Failed to fetch browse media', e);
    } finally {
      setLoading(false);
    }
  };

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === 'all' || value === 'All' || !value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/browse?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateParam('search', searchTerm);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-[#141721] rounded-3xl p-6 shadow-app border border-slate-100/80 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <SlidersHorizontal className="w-6 h-6 text-brand-500" />
            <span>Explore Streaming Catalog</span>
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Browse all full movies, TV shows, and series
          </p>
        </div>

        {/* Quick Search */}
        <form onSubmit={handleSearchSubmit} className="relative max-w-xs w-full">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search titles..."
            className="w-full bg-slate-50 dark:bg-darkCard border border-slate-200 dark:border-white/10 rounded-full px-4 py-2 pl-9 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-brand-500"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </form>
      </div>

      {/* Filter Controls & Sorter Section (Sticky) */}
      <div className="sticky top-[74px] sm:top-[82px] z-20 bg-white/95 dark:bg-[#141721]/95 backdrop-blur-md rounded-3xl p-4 sm:p-5 shadow-md dark:shadow-2xl border border-slate-100/80 dark:border-white/10 space-y-3.5 transition-all">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Type Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-white/10 p-1 rounded-full">
            {[
              { label: 'All', value: 'all' },
              { label: 'Movies', value: 'movie', icon: Film },
              { label: 'TV Series', value: 'tv', icon: Tv },
            ].map((t) => {
              const isSelected = currentType === t.value;
              const Icon = t.icon;
              return (
                <button
                  key={t.value}
                  onClick={() => updateParam('type', t.value)}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition ${
                    isSelected
                      ? 'bg-brand-500 text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-950 dark:hover:text-white'
                  }`}
                >
                  {Icon && <Icon className="w-3.5 h-3.5" />}
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-400">Sort by:</span>
            <select
              value={currentSort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="bg-slate-50 dark:bg-darkCard border border-slate-200 dark:border-white/10 text-xs font-semibold rounded-full px-3.5 py-1.5 text-gray-800 dark:text-gray-200 focus:outline-none focus:border-brand-500 shadow-sm"
            >
              <option value="newest_added">✨ Newest Added First</option>
              <option value="views">🔥 Most Popular</option>
              <option value="rating">⭐ Highest Rated</option>
              <option value="newest">📅 Release Date</option>
              <option value="title">🔤 Title A-Z</option>
            </select>
          </div>
        </div>

        {/* Genre Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {GENRES.map((g) => {
            const isSelected = currentGenre === g || (g === 'All' && !searchParams.get('genre'));
            return (
              <button
                key={g}
                onClick={() => updateParam('genre', g)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                  isSelected
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-950 shadow-sm'
                    : 'bg-slate-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:text-gray-950 dark:hover:text-white'
                }`}
              >
                {g}
              </button>
            );
          })}
        </div>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-gray-400 space-y-3">
          <RefreshCw className="w-6 h-6 animate-spin text-brand-500" />
          <p className="text-xs font-semibold">Loading catalog...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
          <h3 className="text-base font-bold text-gray-900">No titles found</h3>
          <p className="text-xs text-gray-500 mt-1">Try resetting your filters or search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <CardYouMightLike key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-gray-400">Loading catalog...</div>}>
      <BrowseContent />
    </Suspense>
  );
}
