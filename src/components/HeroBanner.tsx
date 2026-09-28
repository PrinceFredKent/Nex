'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, Star, Plus, Check, Film, Tv, PlayCircle, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { MediaItem } from '@/types';
import { useWatchlist } from './WatchlistProvider';
import TrailerModal from './TrailerModal';

interface HeroBannerProps {
  items: MediaItem[];
}

export default function HeroBanner({ items }: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();

  const featuredList = items.length > 0 ? items.slice(0, 5) : [];
  const current = featuredList[currentIndex];

  useEffect(() => {
    if (featuredList.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredList.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [featuredList.length]);

  if (!current) return null;

  const inWatchlist = isInWatchlist(current.id);

  const toggleWatchlist = () => {
    if (inWatchlist) {
      removeFromWatchlist(current.id);
    } else {
      addToWatchlist(current);
    }
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? featuredList.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredList.length);
  };

  return (
    <>
      <div className="relative w-full min-h-[70vh] sm:min-h-[85vh] flex items-end pb-12 sm:pb-20 overflow-hidden bg-dark-950">
        {/* Backdrop Background with Overlays */}
        <div className="absolute inset-0 z-0">
          <img
            key={current.id}
            src={current.backdropUrl || current.posterUrl}
            alt={current.title}
            className="w-full h-full object-cover object-center animate-fadeIn duration-1000 scale-105 transform ease-out"
          />
          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-r from-dark-950 via-dark-950/70 to-transparent" />
          <div className="absolute inset-0 bg-hero-gradient" />
          <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-dark-950 to-transparent" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl space-y-4 sm:space-y-5">
            {/* Meta Tags */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs sm:text-sm font-semibold">
              <span className="px-2.5 py-1 rounded-md bg-brand-500 text-white shadow-lg shadow-brand-500/30 flex items-center gap-1.5 uppercase tracking-wider text-xs">
                {current.type === 'movie' ? <Film className="w-3.5 h-3.5" /> : <Tv className="w-3.5 h-3.5" />}
                {current.type}
              </span>
              <span className="px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-yellow-400 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-yellow-400" />
                {current.rating} TMDB
              </span>
              <span className="px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-gray-300">
                {current.releaseDate ? current.releaseDate.split('-')[0] : '2024'}
              </span>
              {current.runtime && (
                <span className="px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-gray-300">
                  {current.runtime} min
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none drop-shadow-2xl">
              {current.title}
            </h1>

            {/* Tagline or Genres */}
            {current.tagline && (
              <p className="text-brand-400 font-medium italic text-sm sm:text-base">
                &ldquo;{current.tagline}&rdquo;
              </p>
            )}

            {/* Overview */}
            <p className="text-gray-300 text-sm sm:text-base line-clamp-3 leading-relaxed drop-shadow">
              {current.overview}
            </p>

            {/* Genre Pills */}
            <div className="flex flex-wrap gap-2 pt-1">
              {current.genres?.map((g) => (
                <span
                  key={g}
                  className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 backdrop-blur-sm text-gray-200 border border-white/10"
                >
                  {g}
                </span>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <Link
                href={`/watch/${current.id}`}
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm sm:text-base shadow-xl shadow-brand-500/40 hover:scale-105 transition-all duration-200"
              >
                <Play className="w-5 h-5 fill-white" />
                <span>Watch Now</span>
              </Link>

              {current.trailerKey && (
                <button
                  onClick={() => setIsTrailerOpen(true)}
                  className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-semibold text-sm sm:text-base border border-white/15 transition-all"
                >
                  <PlayCircle className="w-5 h-5 text-red-500" />
                  <span>Trailer</span>
                </button>
              )}

              <button
                onClick={toggleWatchlist}
                className="flex items-center gap-2 px-4 py-3.5 rounded-xl bg-dark-850/80 hover:bg-dark-800 text-white font-semibold text-sm border border-white/10 transition-all"
                title={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
              >
                {inWatchlist ? (
                  <>
                    <Check className="w-5 h-5 text-emerald-400" />
                    <span className="hidden sm:inline">In List</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    <span className="hidden sm:inline">Watchlist</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Slide Indicators & Arrows */}
        {featuredList.length > 1 && (
          <div className="absolute bottom-6 right-4 sm:right-8 z-20 flex items-center gap-3">
            <button
              onClick={prevSlide}
              className="p-2 rounded-full bg-black/60 hover:bg-brand-500 text-white border border-white/10 transition"
              aria-label="Previous Featured"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex gap-1.5">
              {featuredList.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === currentIndex ? 'w-6 bg-brand-500' : 'w-2 bg-white/30 hover:bg-white/60'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
            <button
              onClick={nextSlide}
              className="p-2 rounded-full bg-black/60 hover:bg-brand-500 text-white border border-white/10 transition"
              aria-label="Next Featured"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Trailer Modal */}
      <TrailerModal
        isOpen={isTrailerOpen}
        onClose={() => setIsTrailerOpen(false)}
        trailerKey={current.trailerKey}
        title={current.title}
      />
    </>
  );
}
