'use client';

import React from 'react';
import { RotateCw, AlertTriangle } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 mb-4 shadow-lg shadow-red-500/20">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h2 className="text-3xl font-black text-white">Something went wrong</h2>
      <p className="text-gray-400 text-sm mt-2 max-w-md">
        An error occurred while loading this stream. Please try refreshing.
      </p>
      <button
        onClick={() => reset()}
        className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm shadow-xl shadow-brand-500/30 transition"
      >
        <RotateCw className="w-4 h-4" />
        <span>Try Again</span>
      </button>
    </div>
  );
}
