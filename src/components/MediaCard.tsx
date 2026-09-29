'use client';

import React from 'react';
import Link from 'next/link';
import { Play, Star, Plus, Check, Film, Tv } from 'lucide-react';
import { MediaItem } from '@/types';
import { useWatchlist } from './WatchlistProvider';
import { useToast } from './ToastProvider';

interface MediaCardProps {
  item: MediaItem;
  priority?: boolean;
}

export default function MediaCard({ item }: MediaCardProps) {
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const toast = useToast();
  const inWatchlist = isInWatchlist(item.id);

  const toggleWatchlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWatchlist) {
      removeFromWatchlist(item.id);
      toast.info(`Removed "${item.title}" from favorites`);
    } else {
      addToWatchlist(item);
      toast.success(`Saved "${item.title}" to favorites!`);
    }
  };

  const year = item.releaseDate ? item.releaseDate.split('-')[0] : '';

  return (
    <div className="group relative flex flex-col rounded-xl overflow-hidden bg-dark-850 border border-white/5 hover:border-brand-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-brand-500/10 hover:-translate-y-1">
      {/* Poster Image Container */}
      <Link href={`/watch/${item.id}`} className="relative aspect-[2/3] w-full overflow-hidden bg-dark-900 block">
        <img
          src={item.posterUrl}
          alt={item.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Hover Overlay with Big Play Icon */}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
          <div className="w-12 h-12 rounded-full bg-brand-500 text-white flex items-center justify-center shadow-lg shadow-brand-500/50 transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-6 h-6 fill-white ml-0.5" />
          </div>
        </div>

        {/* Top Badges */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5 z-10">
          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-black/70 backdrop-blur-md text-white border border-white/10 flex items-center gap-1">
            {item.type === 'movie' ? <Film className="w-2.5 h-2.5" /> : <Tv className="w-2.5 h-2.5" />}
            {item.type}
          </span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-brand-500/90 text-white shadow-sm">
            HD
          </span>
        </div>

        {/* Watchlist Quick Button */}
        <button
          onClick={toggleWatchlist}
          title={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-brand-500 backdrop-blur-md text-white border border-white/10 transition-all z-10 opacity-0 group-hover:opacity-100"
        >
          {inWatchlist ? <Check className="w-4 h-4 text-emerald-400" /> : <Plus className="w-4 h-4" />}
        </button>

        {/* Bottom Rating on Image */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md border border-white/10 text-xs font-bold text-yellow-400">
          <Star className="w-3.5 h-3.5 fill-yellow-400" />
          <span>{item.rating ? item.rating.toFixed(1) : '7.0'}</span>
        </div>
      </Link>

      {/* Info Section */}
      <div className="p-3 flex flex-col flex-1 justify-between gap-1">
        <Link href={`/watch/${item.id}`} className="block">
          <h3 className="font-semibold text-sm text-white truncate group-hover:text-brand-400 transition">
            {item.title}
          </h3>
        </Link>
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{year}</span>
          <span className="truncate max-w-[110px] text-[11px] text-gray-500">
            {item.genres?.[0] || 'Entertainment'}
          </span>
        </div>
      </div>
    </div>
  );
}
