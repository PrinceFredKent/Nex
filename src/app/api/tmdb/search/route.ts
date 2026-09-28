import { NextRequest, NextResponse } from 'next/server';
import { searchTMDB } from '@/lib/tmdb';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    const type = (searchParams.get('type') || 'multi') as 'movie' | 'tv' | 'multi';

    if (!query) {
      return NextResponse.json({ success: true, results: [] });
    }

    const settings = db.getSettings();
    const results = await searchTMDB(query, type, settings.tmdbApiKey);
    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
