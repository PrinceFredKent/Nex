'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Play, ChevronUp, ChevronDown, Flame, Star, Film, Plus, Shield } from 'lucide-react';
import { MediaItem } from '@/types';
import TrailerModal from './TrailerModal';

interface HeroFeaturedCardProps {
  items: MediaItem[];
}

export default function HeroFeaturedCard({ items }: HeroFeaturedCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);

  if (!items || items.length === 0) {
    return (
      <div className="relative w-full rounded-[2rem] bg-gradient-to-br from-cinemaDark-950 via-slate-900 to-black overflow-hidden shadow-hero min-h-[300px] flex items-center justify-between p-8 sm:p-12 border border-slate-800 text-white">
        <div className="max-w-md space-y-4">
          <div className="inline-flex items-center gap-2 bg-brand-500/20 text-brand-500 border border-brand-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <Film className="w-3.5 h-3.5" />
            <span>Welcome to Nex</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Your Cinema Catalog is Ready
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 font-medium leading-relaxed">
            Search any movie or TV series title from the Admin Panel to automatically pull HD posters, cast, trailers, and free streaming servers.
          </p>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-full text-xs font-bold shadow-lg shadow-brand-500/30 transition transform hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Add Movies in Admin</span>
          </Link>
        </div>

        <div className="hidden md:flex items-center justify-center w-36 h-36 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-500">
          <Shield className="w-16 h-16 opacity-80" />
        </div>
      </div>
    );
  }

  const current = items[currentIndex] || items[0];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  };

  const year = current.releaseDate ? current.releaseDate.split('-')[0] : '2024';
  const hours = current.runtime 
    ? `${Math.floor(current.runtime / 60)} hrs ${current.runtime % 60 ? `${current.runtime % 60}m` : ''}` 
    : '2 hrs';

  return (
    <>
      <div className="relative w-full rounded-[2rem] bg-cinemaDark-950 overflow-hidden shadow-hero min-h-[360px] sm:min-h-[390px] flex items-center border border-black/10 text-white">
        {/* Backdrop / Character Image Layer */}
        <div className="absolute inset-0 z-0">
          <img
            key={current.id}
            src={current.backdropUrl || current.posterUrl}
            alt={current.title}
            className="w-full h-full object-cover object-right sm:object-center animate-fadeIn duration-700"
          />
          {/* Subtle gradient vignette to keep text ultra crisp */}
          <div className="absolute inset-0 bg-gradient-to-r from-cinemaDark-950 via-cinemaDark-950/85 sm:via-cinemaDark-950/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-cinemaDark-950/90 via-transparent to-transparent sm:hidden" />
        </div>

        {/* Content Details */}
        <div className="relative z-10 p-6 sm:p-10 max-w-xl space-y-4">
          {/* Trending Badge */}
          <div className="inline-flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold border border-white/10 text-brand-500">
            <Flame className="w-3.5 h-3.5 fill-brand-500" />
            <span className="text-white text-[11px] font-bold tracking-wide uppercase">Trending Now</span>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight uppercase font-sans line-clamp-2 drop-shadow-md">
            {current.title}
          </h1>

          {/* Metadata Meta Pill */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-medium text-gray-300">
            <span>{year}</span>
            <span className="w-1 h-1 rounded-full bg-gray-500" />
            <span>{hours}</span>
            <span className="w-1 h-1 rounded-full bg-gray-500" />
            <span className="px-2 py-0.5 rounded-full bg-white/15 text-[11px] font-bold text-white border border-white/20">
              {current.genres?.[0] || (current.type === 'tv' ? 'TV Series' : 'Movie')}
            </span>
            <div className="flex items-center gap-1 text-amber-400 font-bold ml-1">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{current.rating ? current.rating.toFixed(1) : '7.5'}</span>
            </div>
          </div>

          {/* Overview text */}
          <p className="text-xs sm:text-sm text-gray-300 line-clamp-3 leading-relaxed max-w-lg font-normal drop-shadow-sm">
            {current.overview}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <Link
              href={`/watch/${current.id}`}
              className="px-7 py-3 rounded-full bg-white text-gray-950 font-bold text-xs hover:bg-slate-100 transition shadow-lg flex items-center gap-2 group transform active:scale-95"
            >
              <Play className="w-3.5 h-3.5 fill-current text-gray-950 group-hover:text-brand-500 transition-colors" />
              <span>Watch</span>
            </Link>

            {current.trailerKey && (
              <button
                onClick={() => setIsTrailerOpen(true)}
                className="px-5 py-3 rounded-full bg-black/40 hover:bg-black/60 border border-white/20 backdrop-blur-md text-white font-semibold text-xs transition flex items-center gap-2"
              >
                <Film className="w-3.5 h-3.5" />
                <span>Trailer</span>
              </button>
            )}
          </div>
        </div>

        {/* Vertical Carousel Controls (matching screenshot ^ and v navigation) */}
        {items.length > 1 && (
          <div className="absolute right-6 sm:right-8 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-3">
            <button
              onClick={prevSlide}
              aria-label="Previous Slide"
              className="w-10 h-10 rounded-full bg-black/50 hover:bg-brand-500 text-white backdrop-blur-md border border-white/15 flex items-center justify-center transition shadow-lg hover:scale-105 active:scale-95"
            >
              <ChevronUp className="w-5 h-5" />
            </button>
            <button
              onClick={nextSlide}
              aria-label="Next Slide"
              className="w-10 h-10 rounded-full bg-black/50 hover:bg-brand-500 text-white backdrop-blur-md border border-white/15 flex items-center justify-center transition shadow-lg hover:scale-105 active:scale-95"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Trailer Lightbox Modal */}
      {current.trailerKey && (
        <TrailerModal
          isOpen={isTrailerOpen}
          onClose={() => setIsTrailerOpen(false)}
          trailerKey={current.trailerKey}
          title={current.title}
        />
      )}
    </>
  );
}
