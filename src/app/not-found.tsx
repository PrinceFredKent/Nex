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
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-xl shadow-brand-500/30 transition"
      >
        <Home className="w-4 h-4" />
        <span>Return to Home Cinema</span>
      </Link>
    </div>
  );
}
