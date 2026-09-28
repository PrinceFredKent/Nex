'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MediaItem } from '@/types';
import MediaCard from './MediaCard';

interface MediaRowProps {
  title: string;
  icon?: React.ReactNode;
  items: MediaItem[];
  viewAllHref?: string;
}

export default function MediaRow({ title, icon, items, viewAllHref }: MediaRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = clientWidth * 0.75;
      rowRef.current.scrollTo({
        left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <section className="relative py-6 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2.5">
          {icon && <span className="text-brand-500">{icon}</span>}
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            {title}
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/10 text-gray-400">
              {items.length}
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="text-xs sm:text-sm font-semibold text-brand-400 hover:text-brand-300 transition mr-2"
            >
              Explore All →
            </Link>
          )}
          <button
            onClick={() => scroll('left')}
            className="p-2 rounded-full bg-dark-850 hover:bg-brand-500 text-gray-300 hover:text-white border border-white/10 transition shadow-md"
            aria-label="Previous"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-2 rounded-full bg-dark-850 hover:bg-brand-500 text-gray-300 hover:text-white border border-white/10 transition shadow-md"
            aria-label="Next"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Scroll Area */}
      <div
        ref={rowRef}
        className="flex gap-4 overflow-x-auto px-4 sm:px-6 lg:px-8 py-2 no-scrollbar scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map((item) => (
          <div key={item.id} className="w-[160px] sm:w-[200px] md:w-[220px] shrink-0">
            <MediaCard item={item} />
          </div>
        ))}
      </div>
    </section>
  );
}
