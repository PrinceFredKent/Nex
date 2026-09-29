'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, type Variants } from 'motion/react';
import { Play, ChevronUp, ChevronDown, Flame, Star, Film, Plus, Shield } from 'lucide-react';
import { MediaItem } from '@/types';
import TrailerModal from './TrailerModal';

interface HeroFeaturedCardProps {
  items: MediaItem[];
}

export default function HeroFeaturedCard({ items }: HeroFeaturedCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<number>(1); // 1 = down/next, -1 = up/prev
  const [isHovered, setIsHovered] = useState(false);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);

  const nextSlide = useCallback(() => {
    if (items.length <= 1) return;
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const prevSlide = useCallback(() => {
    if (items.length <= 1) return;
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
  }, [items.length]);

  const goToSlide = (index: number) => {
    if (index === currentIndex) return;
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  // Automatic slide show through all featured movies with smooth vertical transition
  useEffect(() => {
    if (items.length <= 1 || isHovered || isTrailerOpen) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 5500);
    return () => clearInterval(interval);
  }, [items.length, isHovered, isTrailerOpen, nextSlide]);

  if (!items || items.length === 0) {
    return (
      <div className="relative w-full rounded-[2rem] bg-gradient-to-br from-cinemaDark-950 via-slate-900 to-black overflow-hidden shadow-hero min-h-[320px] flex items-center justify-between p-8 sm:p-12 border border-slate-800 text-white">
        <div className="max-w-md space-y-4">
          <div className="inline-flex items-center gap-2 bg-brand-500/20 text-brand-500 border border-brand-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <Film className="w-3.5 h-3.5" />
            <span>Welcome to Nex</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Your Cinema Catalog is Ready
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 font-medium leading-relaxed">
            Search any movie or TV series title from the Admin Panel to automatically pull HD posters, cast, trailers, and streaming servers.
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
  const year = current.releaseDate ? current.releaseDate.split('-')[0] : '2024';
  const hours = current.runtime 
    ? `${Math.floor(current.runtime / 60)}h ${current.runtime % 60 ? `${current.runtime % 60}m` : ''}` 
    : '2h';

  // Smooth vertical slide variants
  const slideVariants: Variants = {
    enter: (dir: number) => ({
      y: dir > 0 ? 80 : -80,
      opacity: 0,
      scale: 0.98,
    }),
    center: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        y: { type: 'spring' as const, stiffness: 220, damping: 26 },
        opacity: { duration: 0.4 },
        scale: { duration: 0.4 },
      },
    },
    exit: (dir: number) => ({
      y: dir > 0 ? -80 : 80,
      opacity: 0,
      scale: 0.98,
      transition: {
        y: { type: 'spring' as const, stiffness: 220, damping: 26 },
        opacity: { duration: 0.35 },
        scale: { duration: 0.35 },
      },
    }),
  };

  return (
    <>
      <div 
        className="relative w-full rounded-[2rem] bg-cinemaDark-950 overflow-hidden shadow-hero min-h-[370px] sm:min-h-[410px] flex items-center border border-black/10 text-white group select-none"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={current.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0 w-full h-full flex items-center"
          >
            {/* Backdrop Image Layer */}
            <div className="absolute inset-0 z-0 overflow-hidden">
              <img
                src={current.backdropUrl || current.posterUrl}
                alt={current.title}
                className="w-full h-full object-cover object-right sm:object-center transition-transform duration-1000 group-hover:scale-105"
              />
              {/* Vignette gradients to ensure pristine text readability */}
              <div className="absolute inset-0 bg-gradient-to-r from-cinemaDark-950 via-cinemaDark-950/90 sm:via-cinemaDark-950/75 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-cinemaDark-950/95 via-transparent to-transparent sm:hidden" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60" />
            </div>

            {/* Content Details */}
            <div className="relative z-10 p-6 sm:p-10 md:p-12 max-w-xl space-y-4">
              {/* Featured / High Rating Badge */}
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 bg-brand-500/25 border border-brand-500/40 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-brand-400 shadow-sm">
                  <Flame className="w-3.5 h-3.5 fill-brand-400" />
                  <span className="tracking-wide uppercase text-[10px] sm:text-[11px]">
                    Featured Blockbuster
                  </span>
                </span>
                {current.rating && current.rating >= 7.0 && (
                  <span className="inline-flex items-center gap-1 bg-amber-500/20 border border-amber-500/30 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold text-amber-300">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span>Top Rated</span>
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight uppercase font-sans line-clamp-2 drop-shadow-md">
                {current.title}
              </h1>

              {/* Metadata Pill Row */}
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
                  className="px-7 py-3 rounded-full bg-white text-gray-950 font-bold text-xs hover:bg-slate-100 transition shadow-lg flex items-center gap-2 group/btn transform active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-current text-gray-950 group-hover/btn:text-brand-500 transition-colors" />
                  <span>Watch Now</span>
                </Link>

                {current.trailerKey && (
                  <button
                    onClick={() => setIsTrailerOpen(true)}
                    className="px-5 py-3 rounded-full bg-black/40 hover:bg-black/60 border border-white/20 backdrop-blur-md text-white font-semibold text-xs transition flex items-center gap-2 transform active:scale-95"
                  >
                    <Film className="w-3.5 h-3.5" />
                    <span>Trailer</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Vertical Slide Controls & Dots Navigator */}
        {items.length > 1 && (
          <div className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-2.5 bg-black/40 backdrop-blur-md p-2 rounded-full border border-white/10 shadow-xl">
            {/* Slide Up Button */}
            <button
              onClick={prevSlide}
              aria-label="Previous Slide (Slide Up)"
              title="Previous Featured Title"
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-brand-500 text-white flex items-center justify-center transition hover:scale-110 active:scale-90"
            >
              <ChevronUp className="w-4 h-4" />
            </button>

            {/* Vertical Dots */}
            <div className="flex flex-col items-center gap-1.5 py-1">
              {items.map((item, idx) => {
                const isActive = idx === currentIndex;
                return (
                  <button
                    key={item.id}
                    onClick={() => goToSlide(idx)}
                    title={`Slide to ${item.title}`}
                    className={`transition-all duration-300 rounded-full ${
                      isActive
                        ? 'w-2 h-5 bg-brand-500 shadow-md shadow-brand-500/50'
                        : 'w-2 h-2 bg-white/30 hover:bg-white/60 hover:scale-125'
                    }`}
                  />
                );
              })}
            </div>

            {/* Slide Down Button */}
            <button
              onClick={nextSlide}
              aria-label="Next Slide (Slide Down)"
              title="Next Featured Title"
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-brand-500 text-white flex items-center justify-center transition hover:scale-110 active:scale-90"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Subtle Slideshow Progress Indicator along bottom edge */}
        {items.length > 1 && (
          <div className="absolute bottom-0 inset-x-0 h-1 bg-white/10 z-20 overflow-hidden">
            <motion.div
              key={`progress-${currentIndex}-${isHovered}`}
              initial={{ width: '0%' }}
              animate={{ width: isHovered ? '0%' : '100%' }}
              transition={{ duration: 5.5, ease: 'linear' }}
              className="h-full bg-brand-500/80"
            />
          </div>
        )}
      </div>

      {/* Trailer Modal */}
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
