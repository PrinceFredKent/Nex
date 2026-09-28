import React from 'react';
import { db } from '@/lib/db';
import HeroFeaturedCard from '@/components/HeroFeaturedCard';
import CardYouMightLike from '@/components/CardYouMightLike';
import Link from 'next/link';

export const revalidate = 0;

export default async function HomePage() {
  const allMedia = await db.getAll();

  const featured = allMedia.filter((m) => m.featured);
  const heroItems = featured.length > 0 ? featured : allMedia.slice(0, 5);

  const youMightLike = allMedia.filter((m) => m.id !== heroItems[0]?.id).slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Hero Featured Blockbuster */}
      <HeroFeaturedCard items={heroItems} />

      {/* "You Might Like" Section matching UI screenshot */}
      {youMightLike.length > 0 && (
        <section className="space-y-4 pt-1">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-gray-900 tracking-tight">
              You Might Like
            </h2>
            <Link
              href="/browse"
              className="text-xs font-semibold text-gray-500 hover:text-brand-500 transition"
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
