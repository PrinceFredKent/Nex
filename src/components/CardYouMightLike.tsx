'use client';

import React from 'react';
import Link from 'next/link';
import { Play } from 'lucide-react';
import { MediaItem } from '@/types';

interface CardYouMightLikeProps {
  item: MediaItem;
}

export default function CardYouMightLike({ item }: CardYouMightLikeProps) {
  const year = item.releaseDate ? item.releaseDate.split('-')[0] : '2023';
  const genre = item.genres?.[0] || 'Drama';
  const seasonsCount = item.seasons?.length || (item.type === 'tv' ? 3 : 1);
  const subtitle = item.type === 'tv' 
    ? `${year} ${genre} ${seasonsCount} Season${seasonsCount > 1 ? 's' : ''}`
    : `${year} ${genre} Movie`;

  return (
    <Link
      href={`/watch/${item.id}`}
      className="group relative block aspect-[16/10] sm:aspect-[16/9.5] w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-cinemaDark-950"
    >
      {/* Background Image */}
      <img
        src={item.backdropUrl || item.posterUrl}
        alt={item.title}
        loading="lazy"
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />

      {/* Bottom Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-4 sm:p-5">
        <div className="flex items-end justify-between gap-3">
          {/* Text Information */}
          <div className="min-w-0 pr-2">
            <h3 className="text-white font-bold text-sm sm:text-base truncate group-hover:text-brand-400 transition">
              {item.title}
            </h3>
            <p className="text-[11px] sm:text-xs text-gray-300 font-medium truncate mt-0.5 opacity-90">
              {subtitle}
            </p>
          </div>

          {/* Glowing Circular Red Play Button */}
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-brand-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-brand-500/40 group-hover:scale-110 group-hover:bg-brand-600 transition-transform">
            <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
          </div>
        </div>
      </div>
    </Link>
  );
}
