import { NextRequest, NextResponse } from 'next/server';
import { fetchFullTMDBDetails } from '@/lib/tmdb';
import { db } from '@/lib/db';
import { MediaType } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tmdbId = searchParams.get('tmdbId');
    const type = (searchParams.get('type') || 'movie') as MediaType;
    const autoSave = searchParams.get('autoSave') === 'true';

    if (!tmdbId) {
      return NextResponse.json({ success: false, error: 'tmdbId parameter is required' }, { status: 400 });
    }

    const settings = db.getSettings();
    const details = await fetchFullTMDBDetails(tmdbId, type, settings.tmdbApiKey);

    if (autoSave) {
      const saved = await db.create(details as any);
      return NextResponse.json({ success: true, saved: true, data: saved });
    }

    return NextResponse.json({ success: true, saved: false, data: details });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
