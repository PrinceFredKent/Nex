'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Play, Download, Menu, ChevronUp, ChevronDown, Flame, Star, Film } from 'lucide-react';
import { MediaItem } from '@/types';
import TrailerModal from './TrailerModal';

interface HeroFeaturedCardProps {
  items: MediaItem[];
}

export default function HeroFeaturedCard({ items }: HeroFeaturedCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);

  // If no featured, fallback to seed
  const featuredList = items.length > 0 ? items : [];
  const current = featuredList[currentIndex] || {
    id: 'movie-avatar',
    title: 'AVATAR 3: FIRE AND ASH',
    releaseDate: '2023',
    runtime: 180,
    rating: 8.2,
    overview: 'Avatar: Fire and Ash is an epic sci-fi adventure that continues the journey of Jake Sully and Neytiri as they protect their family and Pandora from growing threats.',
    backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop',
    trailerKey: 'd9MyW72ELq0',
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % featuredList.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? featuredList.length - 1 : prev - 1));
  };

  const year = current.releaseDate ? current.releaseDate.split('-')[0] : '2024';
  const hours = current.runtime ? `${Math.floor(current.runtime / 60)} hrs ${current.runtime % 60 ? `${current.runtime % 60}m` : ''}` : '2.5 hrs';

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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-semibold text-gray-200 shadow-sm">
            <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
            <span>Trending Now</span>
          </div>

          {/* Title */}
          <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight leading-tight drop-shadow-md">
            {current.title}
          </h2>

          {/* Metadata String: 2023 • 3 hrs • IMDB 8.2/10 */}
          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-300">
            <span>{year}</span>
            <span>•</span>
            <span>{hours}</span>
            <span>•</span>
            <span className="text-yellow-400 font-bold">
              IMDB {current.rating ? current.rating.toFixed(1) : '8.0'}/10
            </span>
          </div>

          {/* Synopsis */}
          <p className="text-xs sm:text-sm text-gray-300/90 line-clamp-3 leading-relaxed max-w-md">
            {current.overview}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            {/* Watch Button */}
            <Link
              href={`/watch/${current.id}`}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-gray-950 font-bold text-xs sm:text-sm hover:bg-gray-100 hover:scale-105 transition shadow-lg"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Watch</span>
            </Link>

            {/* Download / Trailer Button */}
            <button
              onClick={() => setIsTrailerOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/15 text-white font-semibold text-xs sm:text-sm transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Trailer</span>
            </button>

            {/* List / Options Button */}
            <Link
              href={`/watch/${current.id}`}
              className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/15 text-white flex items-center justify-center transition"
            >
              <Menu className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Up & Down Carousel Controls (Right) */}
        {featuredList.length > 1 && (
          <div className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2">
            <button
              onClick={prevSlide}
              className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition shadow-md"
              aria-label="Previous Slide"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              onClick={nextSlide}
              className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/30 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition shadow-md"
              aria-label="Next Slide"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Trailer Lightbox */}
      <TrailerModal
        isOpen={isTrailerOpen}
        onClose={() => setIsTrailerOpen(false)}
        trailerKey={current.trailerKey}
        title={current.title}
      />
    </>
  );
}
