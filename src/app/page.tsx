import React from 'react';
import { db } from '@/lib/db';
import HeroFeaturedCard from '@/components/HeroFeaturedCard';
import CardYouMightLike from '@/components/CardYouMightLike';
import Link from 'next/link';

export const revalidate = 0;

export default async function HomePage() {
  const allMedia = await db.getAll();

  // Top 6 Featured Movies/Shows:
  // Select top 6 highest-rated blockbuster titles (rating >= 7.0 and featured priority)
  const topFeatured = [...allMedia]
    .filter((m) => m.featured || (m.rating && m.rating >= 7.0))
    .sort((a, b) => {
      const ratingDiff = (b.rating || 0) - (a.rating || 0);
      if (ratingDiff !== 0) return ratingDiff;
      return (b.views || 0) - (a.views || 0);
    });

  const heroItems = topFeatured.slice(0, 6);

  // If fewer than 6, backfill with next best titles
  if (heroItems.length < 6) {
    const existingHeroIds = new Set(heroItems.map((m) => m.id));
    const backfill = [...allMedia]
      .filter((m) => !existingHeroIds.has(m.id))
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 6 - heroItems.length);
    heroItems.push(...backfill);
  }

  const heroIds = new Set(heroItems.map((m) => m.id));
  const youMightLike = allMedia.filter((m) => !heroIds.has(m.id)).slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Hero Featured Blockbuster */}
      <HeroFeaturedCard items={heroItems} />

      {/* "You Might Like" Section matching UI screenshot */}
      {youMightLike.length > 0 && (
        <section className="space-y-4 pt-1">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
              You Might Like
            </h2>
            <Link
              href="/browse"
              className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-brand-500 transition"
            >
              See all
            </Link>
          </div>

          {/* 3-column Grid matching the screenshot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {youMightLike.map((item) => (
              <CardYouMightLike key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
