'use client';

import React from 'react';
import Link from 'next/link';
import { Film, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-brand-500 mb-4 shadow-lg shadow-brand-500/20">
        <Film className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-black text-white">404 - Title Not Found</h1>
      <p className="text-gray-400 text-sm mt-2 max-w-md">
        The movie, show, or page you are looking for might have been removed or is temporarily unavailable.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-lg shadow-brand-500/25 transition"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Return Home</span>
        </Link>
        <Link
          href="/browse"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/10 transition"
        >
          <span>Explore Catalog</span>
        </Link>
        <Link
          href="/watchlist"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/10 transition"
        >
          <span>My Watchlist</span>
        </Link>
      </div>
    </div>
  );
}
