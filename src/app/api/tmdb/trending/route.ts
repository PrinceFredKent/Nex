import { NextRequest, NextResponse } from 'next/server';
import { getTMDBTrending, getTMDBPopular } from '@/lib/tmdb';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || 'trending';
    const type = (searchParams.get('type') || 'movie') as 'movie' | 'tv';

    const settings = db.getSettings();
    let results: any[] = [];

    if (category === 'popular') {
      results = await getTMDBPopular(type, settings.tmdbApiKey);
    } else {
      results = await getTMDBTrending(type, 'week', settings.tmdbApiKey);
    }

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
