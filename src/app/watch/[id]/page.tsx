import React from 'react';
import { db } from '@/lib/db';
import { fetchFullTMDBDetails } from '@/lib/tmdb';
import StreamPlayer from '@/components/StreamPlayer';
import CardYouMightLike from '@/components/CardYouMightLike';
import { Star, Film, Tv, Calendar, Clock, Eye, Sparkles, ArrowLeft, Home, Compass } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 0;

interface WatchPageProps {
  params: { id: string };
}

export default async function WatchPage({ params }: WatchPageProps) {
  const id = params.id;
  let media = await db.getById(id);

  // Dynamic on-demand TMDB resolution fallback if not in local store
  if (!media) {
    let resolvedType: 'movie' | 'tv' = 'movie';
    let rawTmdbId = id;

    if (id.startsWith('tv-')) {
      resolvedType = 'tv';
      rawTmdbId = id.replace('tv-', '');
    } else if (id.startsWith('movie-')) {
      resolvedType = 'movie';
      rawTmdbId = id.replace('movie-', '');
    }

    if (!isNaN(Number(rawTmdbId))) {
      try {
        const tmdbData = await fetchFullTMDBDetails(rawTmdbId, resolvedType);
        if (tmdbData && tmdbData.title) {
          media = await db.create({
            id: id,
            tmdbId: Number(rawTmdbId),
            title: tmdbData.title,
            type: resolvedType,
            overview: tmdbData.overview || 'Enjoy streaming in HD quality with automated server selection.',
            tagline: tmdbData.tagline,
            posterUrl: tmdbData.posterUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop',
            backdropUrl: tmdbData.backdropUrl || tmdbData.posterUrl || 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=1600&auto=format&fit=crop',
            releaseDate: tmdbData.releaseDate || new Date().toISOString().split('T')[0],
            rating: tmdbData.rating || 7.5,
            runtime: tmdbData.runtime,
            genres: tmdbData.genres || ['Entertainment'],
            cast: tmdbData.cast || [],
            director: tmdbData.director,
            trailerKey: tmdbData.trailerKey,
            featured: true,
            trending: false,
            status: 'published',
            streams: tmdbData.streams || [],
            seasons: tmdbData.seasons || [],
          });
        }
      } catch (err) {
        console.error('Error auto-resolving TMDB title on watch page:', err);
      }
    }
  }

  // Related / Recommended titles
  const allMedia = await db.getAll();
  const related = allMedia
    .filter((m) => !media || m.id !== media.id)
    .slice(0, 3);

  // Graceful in-page Fallback if title cannot be found
  if (!media) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#141721] text-gray-700 dark:text-gray-200 hover:text-brand-500 text-xs font-bold shadow-sm border border-slate-100/80 dark:border-white/10 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>

        <div className="min-h-[50vh] bg-white dark:bg-[#141721] rounded-3xl p-8 sm:p-12 text-center border border-slate-100/80 dark:border-white/10 shadow-app flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-500/15 text-brand-500 flex items-center justify-center border border-brand-500/30 shadow-lg shadow-brand-500/20">
            <Film className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
            Title Not Found in Catalog
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-md">
            The media ID <code className="bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded text-brand-500 font-mono font-bold">&quot;{id}&quot;</code> is currently unavailable.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/25 transition"
            >
              <Home className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
            <Link
              href="/browse"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-gray-800 dark:text-gray-200 font-bold text-xs transition"
            >
              <Compass className="w-4 h-4" />
              <span>Explore All Titles</span>
            </Link>
          </div>
        </div>

        {related.length > 0 && (
          <section className="space-y-3 pt-2">
            <h2 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">
              Trending Suggestions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {related.map((item) => (
                <CardYouMightLike key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    );
  }

  const year = media.releaseDate ? media.releaseDate.split('-')[0] : 'N/A';

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white dark:bg-[#141721] text-gray-700 dark:text-gray-200 hover:text-brand-500 text-xs font-bold shadow-sm border border-slate-100/80 dark:border-white/10 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Main Streaming Video Screen */}
      <StreamPlayer media={media} />

      {/* Media Details & Meta */}
      <div className="bg-white dark:bg-[#141721] rounded-3xl p-6 shadow-app border border-slate-100/80 dark:border-white/10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-brand-500 text-white flex items-center gap-1">
                {media.type === 'movie' ? <Film className="w-3 h-3" /> : <Tv className="w-3 h-3" />}
                {media.type}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-white/10 text-yellow-600 dark:text-yellow-400 border border-slate-200 dark:border-white/10 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-yellow-500 text-yellow-500" />
                {media.rating ? media.rating.toFixed(1) : '7.5'} / 10
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 border border-slate-200 dark:border-white/10 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-gray-400" />
                {year}
              </span>
              {media.runtime && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 border border-slate-200 dark:border-white/10 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-gray-400" />
                  {media.runtime} min
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              {media.title}
            </h1>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {media.genres?.map((g) => (
              <span
                key={g}
                className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 border border-slate-200 dark:border-white/10"
              >
                {g}
              </span>
            ))}
          </div>
        </div>

        {/* Storyline */}
        <div className="space-y-2 border-t border-slate-100 dark:border-white/10 pt-4">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Storyline</h3>
          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
            {media.overview}
          </p>
          {media.director && (
            <p className="text-xs text-gray-500 dark:text-gray-400 pt-1">
              <strong className="text-gray-800 dark:text-gray-200">Director:</strong> {media.director}
            </p>
          )}
        </div>
      </div>

      {/* "You Might Also Like" recommendations */}
      {related.length > 0 && (
        <section className="space-y-3 pt-2">
          <h2 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">
            You Might Like
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {related.map((item) => (
              <CardYouMightLike key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
