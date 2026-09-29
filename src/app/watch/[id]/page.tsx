import React from 'react';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import StreamPlayer from '@/components/StreamPlayer';
import CardYouMightLike from '@/components/CardYouMightLike';
import { Star, Film, Tv, Calendar, Clock, Eye, Sparkles, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 0;

interface WatchPageProps {
  params: { id: string };
}

export default async function WatchPage({ params }: WatchPageProps) {
  const id = params.id;
  const media = await db.getById(id);

  if (!media) {
    notFound();
  }

  // Related / Recommended titles
  const allMedia = await db.getAll();
  const related = allMedia
    .filter((m) => m.id !== media.id)
    .slice(0, 3);

  const year = media.releaseDate ? media.releaseDate.split('-')[0] : 'N/A';

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#141721] text-gray-700 dark:text-gray-200 hover:text-brand-500 text-xs font-bold shadow-sm border border-slate-100/80 dark:border-white/10 transition"
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
              <Link
                key={g}
                href={`/browse?genre=${encodeURIComponent(g)}`}
                className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 border border-slate-200 dark:border-white/10 hover:border-brand-500 hover:text-brand-500 dark:hover:text-brand-400 transition"
              >
                {g}
              </Link>
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
              <strong className="text-gray-800 dark:text-gray-200">Director:</strong>{' '}
              <Link
                href={`/browse?search=${encodeURIComponent(media.director)}`}
                className="hover:text-brand-500 underline decoration-dotted transition"
              >
                {media.director}
              </Link>
            </p>
          )}

          {/* Cast members as clickable links */}
          {media.cast && media.cast.length > 0 && (
            <div className="pt-2">
              <span className="text-xs font-bold text-gray-800 dark:text-gray-200 mr-2">Top Cast:</span>
              <div className="inline-flex flex-wrap gap-1.5 mt-1">
                {media.cast.slice(0, 5).map((actor, idx) => (
                  <Link
                    key={`${actor.name}-${idx}`}
                    href={`/browse?search=${encodeURIComponent(actor.name)}`}
                    className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:text-brand-500 hover:border-brand-500 border border-slate-200 dark:border-white/10 transition"
                  >
                    {actor.name}
                  </Link>
                ))}
              </div>
            </div>
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
