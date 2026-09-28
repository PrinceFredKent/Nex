'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Film, Tv, Star, Loader2, ArrowRight } from 'lucide-react';
import { MediaItem } from '@/types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setQuery('');
      setResults([]);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/movies?search=${encodeURIComponent(query)}`);
        const json = await res.json();
        if (json.success) {
          setResults(json.data);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSelect = (item: MediaItem) => {
    onClose();
    router.push(`/watch/${item.id}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="w-full max-w-2xl bg-dark-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/10 bg-dark-850">
          <Search className="w-5 h-5 text-gray-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search movies, TV shows, actors, genres..."
            className="w-full bg-transparent text-white placeholder-gray-400 text-base focus:outline-none"
          />
          {loading && <Loader2 className="w-5 h-5 text-brand-500 animate-spin mr-2 shrink-0" />}
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2.5 py-1 text-xs font-semibold rounded bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white transition"
          >
            ESC
          </button>
        </div>

        {/* Search Results / Suggestion Body */}
        <div className="overflow-y-auto p-3 space-y-2 divide-y divide-white/5">
          {query.trim() === '' ? (
            <div className="py-12 text-center text-gray-400">
              <Film className="w-10 h-10 mx-auto text-gray-600 mb-2" />
              <p className="text-sm font-medium">Type to search your streaming catalog</p>
              <p className="text-xs text-gray-500 mt-1">Search by title, genre, director or actor name</p>
            </div>
          ) : results.length === 0 && !loading ? (
            <div className="py-10 text-center text-gray-400">
              <p className="text-sm">No streaming titles found for &quot;{query}&quot;</p>
              <p className="text-xs text-gray-500 mt-1">
                Admin can import this movie anytime from the Admin Panel!
              </p>
            </div>
          ) : (
            results.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelect(item)}
                className="flex items-center gap-3.5 p-2.5 rounded-xl hover:bg-white/5 transition cursor-pointer group"
              >
                <img
                  src={item.posterUrl}
                  alt={item.title}
                  className="w-12 h-16 object-cover rounded-lg shrink-0 shadow-md group-hover:scale-105 transition-transform"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-white font-semibold text-sm truncate group-hover:text-brand-400 transition">
                      {item.title}
                    </h4>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-white/10 text-gray-300">
                      {item.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                    <span>{item.releaseDate ? item.releaseDate.split('-')[0] : 'N/A'}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-yellow-400 font-medium">
                      <Star className="w-3 h-3 fill-yellow-400" />
                      {item.rating}
                    </span>
                    <span>•</span>
                    <span className="truncate max-w-[200px]">{item.genres?.slice(0, 2).join(', ')}</span>
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-1 mt-1">
                    {item.overview}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-brand-400 group-hover:translate-x-1 transition shrink-0" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
